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
      // Report to progress callback if provided
      if (progressCallback) {
        const percent = Math.round((current / total) * 100)
        progressCallback(0, percent, `Page ${current} of ${total}`)
      }
    }

    let width = zineConfig.width
    let height = zineConfig.height

    if (zineConfig.unit === 'px') {
      width = width * 0.264583
      height = height * 0.264583
    }

    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [width, height],
    })

    const pageElements = document.querySelectorAll('.page-canvas')

    if (pageElements.length === 0) {
      alert('No page elements found to export!')
      return
    }

    const scaleFactor = 4

    for (let i = 0; i < pageElements.length; i++) {
      updateProgress(i + 1, pageElements.length)
      await new Promise(resolve => setTimeout(resolve, 50))

      if (i > 0) {
        pdf.addPage([width, height])
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

        const imgData = canvas.toDataURL('image/png', 1.0)
        pdf.addImage(imgData, 'PNG', 0, 0, width, height)
      } finally {
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
        pageElement.classList.remove('export-mode')
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
