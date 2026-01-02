import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import axios from 'axios'
import { env } from '@/config/env'

const API_BASE_URL = env.apiUrl

/**
 * Publish PDF to server
 * Similar to exportToPDF but uploads instead of downloading
 */
export async function publishToPDF(zineStore, userToken, progressCallback = null) {
  const { zineConfig, pages } = zineStore
  const isDarkMode = zineStore.ui.theme === 'dark'

  if (!zineConfig || pages.length === 0) {
    throw new Error('No pages to publish')
  }

  if (!userToken) {
    throw new Error('You must be signed in to publish')
  }

  document.body.classList.add('pdf-exporting')

  try {

    const rootStyle = getComputedStyle(document.documentElement)
    const appBackgroundColor =
      (rootStyle.getPropertyValue('--app-bg') || (isDarkMode ? '#0f1419' : '#ffffff')).trim() ||
      (isDarkMode ? '#0f1419' : '#ffffff')
    const pageBackgroundColor =
      (rootStyle.getPropertyValue('--page-bg') || '#ffffff').trim() || '#ffffff'

    const updateProgress = (current, total, status = 'Processing') => {
      // Report to progress callback
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
      throw new Error('No page elements found to publish')
    }

    // Get scale factor from environment or use default
    const scaleFactor = parseFloat(import.meta.env.VITE_PDF_SCALE_FACTOR) || 4

    // Generate PDF pages
    for (let i = 0; i < pageElements.length; i++) {
      updateProgress(i + 1, pageElements.length, 'Processing')
      await new Promise(resolve => setTimeout(resolve, 50))

      if (i > 0) {
        pdf.addPage([pdfWidth, pdfHeight])
      }

      const pageElement = pageElements[i]
      const bodyElement = document.body
      const appElement = document.getElementById('app')
      const workspaceElement = document.querySelector('.canvas-workspace')
      const toolbar = document.querySelector('.layout-toolbar')
      const commandBar = document.querySelector('.command-bar')
      const mediaPanel = document.querySelector('.media-panel')
      const pagePanel = document.querySelector('.page-panel')
      const textToolbar = document.querySelector('.text-toolbar')
      const guidesElement = pageElement.querySelector('.guides')

      const originalBodyBackground = bodyElement.style.background
      const originalAppBackground = appElement ? appElement.style.background : null
      const originalWorkspaceBackground = workspaceElement ? workspaceElement.style.background : null
      const originalToolbarDisplay = toolbar ? toolbar.style.display : null
      const originalCommandBarDisplay = commandBar ? commandBar.style.display : null
      const originalMediaPanelDisplay = mediaPanel ? mediaPanel.style.display : null
      const originalPagePanelDisplay = pagePanel ? pagePanel.style.display : null
      const originalTextToolbarDisplay = textToolbar ? textToolbar.style.display : null
      const originalGuidesDisplay = guidesElement ? guidesElement.style.display : null

      pageElement.classList.add('export-mode')

      if (guidesElement) {
        guidesElement.style.display = 'none'
      }

      try {
        bodyElement.style.setProperty('background', appBackgroundColor, 'important')
        if (appElement) {
          appElement.style.setProperty('background', appBackgroundColor, 'important')
        }
        if (workspaceElement) {
          workspaceElement.style.setProperty('background', appBackgroundColor, 'important')
        }
        if (toolbar) toolbar.style.display = 'none'
        if (commandBar) commandBar.style.display = 'none'
        if (mediaPanel) mediaPanel.style.display = 'none'
        if (pagePanel) pagePanel.style.display = 'none'
        if (textToolbar) textToolbar.style.display = 'none'

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
        bodyElement.style.removeProperty('background')
        if (originalBodyBackground) bodyElement.style.background = originalBodyBackground
        if (appElement) {
          appElement.style.removeProperty('background')
          if (originalAppBackground) appElement.style.background = originalAppBackground
        }
        if (workspaceElement) {
          workspaceElement.style.removeProperty('background')
          if (originalWorkspaceBackground) workspaceElement.style.background = originalWorkspaceBackground
        }
        if (toolbar) toolbar.style.display = originalToolbarDisplay ?? ''
        if (commandBar) commandBar.style.display = originalCommandBarDisplay ?? ''
        if (mediaPanel) mediaPanel.style.display = originalMediaPanelDisplay ?? ''
        if (pagePanel) pagePanel.style.display = originalPagePanelDisplay ?? ''
        if (textToolbar) textToolbar.style.display = originalTextToolbarDisplay ?? ''
        if (guidesElement && originalGuidesDisplay !== null) {
          guidesElement.style.display = originalGuidesDisplay
        }
        pageElement.classList.remove('export-mode')
      }
    }

    // Convert PDF to blob
    if (progressCallback) {
      progressCallback(1, 50, 'Preparing PDF')
    }
    
    const pdfBlob = pdf.output('blob')

    // Upload to server
    const formData = new FormData()
    formData.append('pdf', pdfBlob, 'zine.pdf')
    formData.append('title', zineStore.projectMeta.title || 'Untitled Zine')
    formData.append('bookId', zineStore.projectMeta.id || '')
    formData.append('pageCount', pageElements.length)
    
    // Include zineConfig metadata for Order Print page
    formData.append('metadata', JSON.stringify({
      config: zineConfig
    }))

    if (progressCallback) {
      progressCallback(1, 75, 'Uploading to server')
    }
    
    const response = await axios.post(`${API_BASE_URL}/api/published/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${userToken}`
      }
    })
    
    if (progressCallback) {
      progressCallback(2, 100, 'Published successfully!')
    }

    console.log('✅ PDF published successfully:', response.data)
    
    // Small delay to ensure progress UI updates
    await new Promise(resolve => setTimeout(resolve, 100))

    return response.data.publication
  } catch (error) {
    console.error('[PDF Publish] Failed to publish PDF:', error)
    throw error
  } finally {
    document.body.classList.remove('pdf-exporting')
  }
}
