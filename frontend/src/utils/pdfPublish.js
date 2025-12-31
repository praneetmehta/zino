import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4876'

/**
 * Publish PDF to server
 * Similar to exportToPDF but uploads instead of downloading
 */
export async function publishToPDF(zineStore, userToken) {
  const { zineConfig, pages } = zineStore
  const isDarkMode = zineStore.ui.theme === 'dark'

  if (!zineConfig || pages.length === 0) {
    throw new Error('No pages to publish')
  }

  if (!userToken) {
    throw new Error('You must be signed in to publish')
  }

  const overlayBackground = isDarkMode ? 'rgba(4, 6, 15, 0.94)' : 'rgba(0, 0, 0, 0.85)'
  const spinnerBaseColor = isDarkMode ? 'rgba(226, 232, 240, 0.25)' : 'rgba(255, 255, 255, 0.2)'
  const spinnerTopColor = isDarkMode ? '#e2e8f0' : '#ffffff'
  const messageColor = isDarkMode ? '#e2e8f0' : '#ffffff'
  const progressColor = isDarkMode ? 'rgba(148, 163, 184, 0.85)' : 'rgba(255, 255, 255, 0.7)'

  const overlay = document.createElement('div')
  const message = document.createElement('div')
  const progress = document.createElement('div')
  const spinner = document.createElement('div')
  const style = document.createElement('style')

  document.body.classList.add('pdf-exporting')

  let overlayAppended = false
  let styleAppended = false

  try {
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${overlayBackground};
      backdrop-filter: blur(12px) saturate(180%);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 20px;
    `

    message.style.cssText = `
      color: ${messageColor};
      font-size: 24px;
      font-weight: 600;
      text-align: center;
    `
    message.textContent = 'Publishing PDF...'

    progress.style.cssText = `
      color: ${progressColor};
      font-size: 16px;
      font-weight: 500;
      text-align: center;
    `
    progress.textContent = 'Preparing...'

    spinner.style.cssText = `
      width: 48px;
      height: 48px;
      border: 4px solid ${spinnerBaseColor};
      border-top-color: ${spinnerTopColor};
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `

    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
    styleAppended = true

    overlay.appendChild(spinner)
    overlay.appendChild(message)
    overlay.appendChild(progress)
    document.body.appendChild(overlay)
    overlayAppended = true

    const rootStyle = getComputedStyle(document.documentElement)
    const appBackgroundColor =
      (rootStyle.getPropertyValue('--app-bg') || (isDarkMode ? '#0f1419' : '#ffffff')).trim() ||
      (isDarkMode ? '#0f1419' : '#ffffff')
    const pageBackgroundColor =
      (rootStyle.getPropertyValue('--page-bg') || '#ffffff').trim() || '#ffffff'

    const updateProgress = (current, total, status = 'Processing') => {
      progress.textContent = `${status} page ${current} of ${total}...`
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
      throw new Error('No page elements found to publish')
    }

    const scaleFactor = 4

    // Generate PDF pages
    for (let i = 0; i < pageElements.length; i++) {
      updateProgress(i + 1, pageElements.length, 'Processing')
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

        const imgData = canvas.toDataURL('image/png', 1.0)
        pdf.addImage(imgData, 'PNG', 0, 0, width, height)
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
    progress.textContent = 'Uploading to server...'
    const pdfBlob = pdf.output('blob')

    // Upload to server
    const formData = new FormData()
    formData.append('pdf', pdfBlob, 'zine.pdf')
    formData.append('title', zineStore.projectMeta.title || 'Untitled Zine')
    formData.append('bookId', zineStore.projectMeta.id || '')
    formData.append('pageCount', pageElements.length)

    const response = await axios.post(`${API_BASE_URL}/api/published/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${userToken}`
      }
    })

    console.log('✅ PDF published successfully:', response.data)

    return response.data.publication
  } catch (error) {
    console.error('[PDF Publish] Failed to publish PDF:', error)
    throw error
  } finally {
    if (overlayAppended && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay)
    }
    if (styleAppended && style.parentNode) {
      style.parentNode.removeChild(style)
    }
    document.body.classList.remove('pdf-exporting')
  }
}
