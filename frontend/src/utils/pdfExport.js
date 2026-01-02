import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportToPDF(zineStore, progressCallback = null) {
  const { zineConfig, pages } = zineStore
  const isDarkMode = zineStore.ui.theme === 'dark'

  if (!zineConfig || pages.length === 0) {
    throw new Error('No pages to export')
  }

  document.body.classList.add('pdf-exporting')

  try {
    const rootStyle = getComputedStyle(document.documentElement)
    const appBackgroundColor =
      (rootStyle.getPropertyValue('--app-bg') || (isDarkMode ? '#0f1419' : '#ffffff')).trim() ||
      (isDarkMode ? '#0f1419' : '#ffffff')
    const pageBackgroundColor =
      (rootStyle.getPropertyValue('--page-bg') || '#ffffff').trim() || '#ffffff'

    const updateProgress = (current, total) => {
      if (progressCallback) {
        const percent = Math.round((current / total) * 100)
        progressCallback(0, percent, `Page ${current} of ${total}`)
      }
    }

    let width = zineConfig.width
    let height = zineConfig.height

    // Convert to mm if needed
    if (zineConfig.unit === 'px') {
      width = width * 0.264583
      height = height * 0.264583
    } else if (zineConfig.unit === 'in') {
      width = width * 25.4
      height = height * 25.4
    }

    // Add gutter for flat binding (left edge binding margin)
    const gutterMm = zineConfig.bindingType === 'flat' 
      ? (zineConfig.gutter || 0.25) * 25.4  // Convert inches to mm
      : 0

    // Add gutter to width for flat binding
    const pdfWidth = width + gutterMm
    const pdfHeight = height

    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
    })

    const pageElements = document.querySelectorAll('.page-canvas')

    if (pageElements.length === 0) {
      alert('No page elements found to export!')
      return
    }

    // Get scale factor from environment or use default
    const scaleFactor = parseFloat(import.meta.env.VITE_PDF_SCALE_FACTOR) || 4

    for (let i = 0; i < pageElements.length; i++) {
      updateProgress(i + 1, pageElements.length)
      await new Promise(resolve => setTimeout(resolve, 50))

      if (i > 0) {
        pdf.addPage([pdfWidth, pdfHeight])
      }

      const pageElement = pageElements[i]
      
      // Handle images with object-fit: cover and custom positioning
      await handleObjectPositionForExport(pageElement)

      const bodyElement = document.body
      const appElement = document.getElementById('app')
      const workspaceElement = document.querySelector('.canvas-workspace')
      const toolbar = document.querySelector('.layout-toolbar')
      const commandBar = document.querySelector('.command-bar')
      const mediaPanel = document.querySelector('.media-panel')
      const pagePanel = document.querySelector('.page-panel')
      const textToolbar = document.querySelector('.text-toolbar')
      const guidesElement = pageElement.querySelector('.guides')
      const printGuidesElement = pageElement.querySelector('.print-guides')

      const originalBodyBackground = bodyElement.style.background
      const originalAppBackground = appElement ? appElement.style.background : null
      const originalWorkspaceBackground = workspaceElement ? workspaceElement.style.background : null
      const originalToolbarDisplay = toolbar ? toolbar.style.display : null
      const originalCommandBarDisplay = commandBar ? commandBar.style.display : null
      const originalMediaPanelDisplay = mediaPanel ? mediaPanel.style.display : null
      const originalPagePanelDisplay = pagePanel ? pagePanel.style.display : null
      const originalTextToolbarDisplay = textToolbar ? textToolbar.style.display : null
      const originalGuidesDisplay = guidesElement ? guidesElement.style.display : null
      const originalPrintGuidesDisplay = printGuidesElement ? printGuidesElement.style.display : null

      pageElement.classList.add('export-mode')

      if (guidesElement) {
        guidesElement.style.display = 'none'
      }
      if (printGuidesElement) {
        printGuidesElement.style.display = 'none'
      }

      try {
        bodyElement.style.setProperty('background', appBackgroundColor, 'important')
        if (appElement) {
          appElement.style.setProperty('background', appBackgroundColor, 'important')
        }
        if (workspaceElement) {
          workspaceElement.style.setProperty('background', appBackgroundColor, 'important')
        }
        if (toolbar) {
          toolbar.style.display = 'none'
        }
        if (commandBar) {
          commandBar.style.display = 'none'
        }
        if (mediaPanel) {
          mediaPanel.style.display = 'none'
        }
        if (pagePanel) {
          pagePanel.style.display = 'none'
        }
        if (textToolbar) {
          textToolbar.style.display = 'none'
        }

        await new Promise(resolve => setTimeout(resolve, 100))

        const canvas = await html2canvas(pageElement, {
          scale: scaleFactor,
          useCORS: true,
          allowTaint: true,
          backgroundColor: pageBackgroundColor,
          logging: false,
        })

        // For flat binding with normalized left-edge binding:
        // - Odd pages (0, 2, 4...) are right-hand pages → no flip
        // - Even pages (1, 3, 5...) are left-hand pages → flip horizontally
        let finalCanvas = canvas
        const isLeftPage = i % 2 === 1 // Even index (1, 3, 5...) = left page in spread
        
        if (zineConfig.bindingType === 'flat' && isLeftPage) {
          // Create a new canvas and flip the image horizontally
          const flippedCanvas = document.createElement('canvas')
          flippedCanvas.width = canvas.width
          flippedCanvas.height = canvas.height
          const ctx = flippedCanvas.getContext('2d')
          
          // Flip horizontally
          ctx.translate(canvas.width, 0)
          ctx.scale(-1, 1)
          ctx.drawImage(canvas, 0, 0)
          
          finalCanvas = flippedCanvas
        }

        const imgData = finalCanvas.toDataURL('image/png', 1.0)
        
        // For flat binding, offset content to the right by gutter amount
        // This creates the binding margin on the left edge
        const xOffset = gutterMm
        pdf.addImage(imgData, 'PNG', xOffset, 0, width, height)
      } finally {
        // Restore original styles
        bodyElement.style.removeProperty('background')
        if (originalBodyBackground) {
          bodyElement.style.background = originalBodyBackground
        }

        if (appElement) {
          appElement.style.removeProperty('background')
          if (originalAppBackground) {
            appElement.style.background = originalAppBackground
          }
        }

        if (workspaceElement) {
          workspaceElement.style.removeProperty('background')
          if (originalWorkspaceBackground) {
            workspaceElement.style.background = originalWorkspaceBackground
          }
        }

        if (toolbar) {
          toolbar.style.display = originalToolbarDisplay ?? ''
        }
        if (commandBar) {
          commandBar.style.display = originalCommandBarDisplay ?? ''
        }
        if (mediaPanel) {
          mediaPanel.style.display = originalMediaPanelDisplay ?? ''
        }
        if (pagePanel) {
          pagePanel.style.display = originalPagePanelDisplay ?? ''
        }
        if (textToolbar) {
          textToolbar.style.display = originalTextToolbarDisplay ?? ''
        }
        if (guidesElement && originalGuidesDisplay !== null) {
          guidesElement.style.display = originalGuidesDisplay
        }
        if (printGuidesElement && originalPrintGuidesDisplay !== null) {
          printGuidesElement.style.display = originalPrintGuidesDisplay
        }
        pageElement.classList.remove('export-mode')
        
        // Restore image positioning
        await restoreObjectPositionAfterExport(pageElement)
      }
    }

    if (progressCallback) {
      progressCallback(1, 100) // Saving step
    }
    
    const fileName = `zine_${Date.now()}.pdf`
    pdf.save(fileName)
    
    if (progressCallback) {
      progressCallback(2, 100) // Complete
    }
    
    // Small delay to ensure progress UI updates
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (error) {
    console.error('[PDF Export] Failed to export PDF', error)
    throw error
  } finally {
    document.body.classList.remove('pdf-exporting')
  }
}

// Handle object-position for images during PDF export
async function handleObjectPositionForExport(pageElement) {
  const images = pageElement.querySelectorAll('img')
  
  for (const img of images) {
    const computedStyle = getComputedStyle(img)
    const objectFit = computedStyle.objectFit
    const objectPosition = computedStyle.objectPosition
    
    // Only process cover images
    if (objectFit !== 'cover') {
      continue
    }
    
    // Get image dimensions
    const imgRect = img.getBoundingClientRect()
    const imgWidth = img.naturalWidth
    const imgHeight = img.naturalHeight
    
    // Parse object-position values
    const [xStr, yStr] = objectPosition.split(' ')
    const xPercent = parseFloat(xStr) / 100
    const yPercent = parseFloat(yStr) / 100
    
    // Calculate which part of the image is visible for object-fit: cover
    const aspectRatio = imgWidth / imgHeight
    const containerAspect = imgRect.width / imgRect.height
    
    let cropX, cropY, cropWidth, cropHeight
    
    if (aspectRatio > containerAspect) {
      // Image is wider than container, height matches container
      cropHeight = imgHeight
      cropWidth = imgHeight * containerAspect
      
      // Position based on object-position X
      cropX = (imgWidth - cropWidth) * xPercent
      cropY = 0
    }
  }
}

// Handle object-position images by temporarily cropping them for export
async function handleObjectPositionForExport(img) {
  // Skip if image doesn't have custom positioning
  if (img.style.objectPosition === '50% 50%' || !img.style.objectPosition) {
    return
  }
  
  const imgRect = img.getBoundingClientRect()
  const cropX = 0
  const cropY = 0
  const cropWidth = img.naturalWidth
  const cropHeight = img.naturalHeight
  
  const canvas = document.createElement('canvas')
  canvas.width = imgRect.width * 4 // High DPI
  canvas.height = imgRect.height * 4
  const ctx = canvas.getContext('2d')
  
  // Draw the cropped portion
  ctx.drawImage(
    img,
    cropX, cropY, cropWidth, cropHeight, // Source rectangle
    0, 0, canvas.width, canvas.height     // destination rectangle
  )
  
  try {
    // Check if canvas is tainted before calling toDataURL
    const testDataURL = canvas.toDataURL('image/png', 0.1) // Low quality test
    
    // If we get here, canvas is not tainted, proceed with full quality
    const originalSrc = img.src
    img.dataset.originalSrc = originalSrc
    img.src = canvas.toDataURL('image/png')
    
    // Remove object-fit to prevent any interference
    img.style.objectFit = 'contain'
    img.style.objectPosition = 'center'
  } catch (error) {
    // Canvas is tainted, skip cropping and log warning
    console.warn('Skipping image cropping for export due to CORS restrictions:', error)
    // Reset object-position to center to avoid layout issues
    img.style.objectPosition = 'center'
  }
}

// Restore original image positioning after export
async function restoreObjectPositionAfterExport(pageElement) {
  const images = pageElement.querySelectorAll('img[data-original-src]')
  
  for (const img of images) {
    if (img.dataset.originalSrc) {
      img.src = img.dataset.originalSrc
      delete img.dataset.originalSrc
    }
    
    // Restore object-fit and object-position will be reapplied by Vue reactivity
  }
}
