import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { toPx } from './unitConversion'

export async function exportToPDF(zineStore) {
  const { zineConfig, pages } = zineStore

  if (!zineConfig || pages.length === 0) {
    alert('No pages to export!')
    return
  }

  // Convert dimensions to mm for jsPDF
  let width = zineConfig.width
  let height = zineConfig.height

  if (zineConfig.unit === 'px') {
    // Convert px to mm (assuming 96 DPI)
    width = width * 0.264583
    height = height * 0.264583
  }

  // Create PDF with custom dimensions
  const pdf = new jsPDF({
    orientation: width > height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [width, height],
  })

  // Find all page elements in the DOM
  const pageElements = document.querySelectorAll('.page-canvas')
  
  if (pageElements.length === 0) {
    alert('No page elements found to export!')
    return
  }

  // Get actual page dimensions in pixels for high-quality capture
  const pageDimensions = {
    width: toPx(zineConfig.width, zineConfig.unit),
    height: toPx(zineConfig.height, zineConfig.unit)
  }

  // Process each page by capturing it as an image
  for (let i = 0; i < pageElements.length; i++) {
    if (i > 0) {
      pdf.addPage([width, height])
    }

    const pageElement = pageElements[i]
    
    // Capture the page element as a canvas with high quality
    const canvas = await html2canvas(pageElement, {
      scale: 2, // 2x scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: pageDimensions.width,
      height: pageDimensions.height
    })
    
    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    
    // Add image to PDF (fill entire page)
    pdf.addImage(imgData, 'JPEG', 0, 0, width, height)
  }

    // Draw each element
    for (const element of allElements) {
      if (element.type === 'text') {
        // Render text element
        const textEl = element.data
        // Calculate position relative to full page dimensions (not content area)
        const textXmm = (textEl.x / 100) * width
        const textYmm = (textEl.y / 100) * height
        const textWmm = (textEl.width / 100) * width
        const textHmm = (textEl.height / 100) * height

        const style = textEl.style || {}
        
        // Set background if not transparent
        if (style.backgroundColor && style.backgroundColor !== 'transparent') {
          const bgColor = style.backgroundColor
          const r = parseInt(bgColor.slice(1, 3), 16)
          const g = parseInt(bgColor.slice(3, 5), 16)
          const b = parseInt(bgColor.slice(5, 7), 16)
          pdf.setFillColor(r, g, b)
          pdf.rect(textXmm, textYmm, textWmm, textHmm, 'F')
        }

        // Set text properties using shared configuration
        const fontFamily = mapFontToPdf(style.fontFamily || DEFAULT_TEXT_STYLE.fontFamily)
        const fontWeight = style.fontWeight || DEFAULT_TEXT_STYLE.fontWeight
        pdf.setFont(fontFamily, getPdfFontWeight(fontWeight))
        
        // Convert font size from px to pt (jsPDF uses points, not mm)
        const fontSizePt = pxToPt(style.fontSize || DEFAULT_TEXT_STYLE.fontSize)
        pdf.setFontSize(fontSizePt)
        
        const textColor = style.color || '#000000'
        const r = parseInt(textColor.slice(1, 3), 16)
        const g = parseInt(textColor.slice(3, 5), 16)
        const b = parseInt(textColor.slice(5, 7), 16)
        pdf.setTextColor(r, g, b)

        const paddingMm = pxToMm(style.padding || DEFAULT_TEXT_STYLE.padding)
        const textContentXmm = textXmm + paddingMm
        const textContentYmm = textYmm + paddingMm
        const textContentWmm = Math.max(0, textWmm - 2 * paddingMm)

        // Line height in mm (convert pt back to mm for spacing)
        const fontSizeMm = pxToMm(style.fontSize || DEFAULT_TEXT_STYLE.fontSize)
        const lineHeight = (style.lineHeight || DEFAULT_TEXT_STYLE.lineHeight) * fontSizeMm
        const lines = pdf.splitTextToSize(textEl.content || '', textContentWmm)
        
        let currentY = textContentYmm
        lines.forEach((line) => {
          if (currentY + lineHeight <= textYmm + textHmm) {
            const align = style.textAlign || 'left'
            let xPos = textContentXmm
            
            if (align === 'center') {
              xPos = textContentXmm + textContentWmm / 2
            } else if (align === 'right') {
              xPos = textContentXmm + textContentWmm
            }
            
            pdf.text(line, xPos, currentY + fontSizeMm, { align })
            currentY += lineHeight
          }
        })
        continue
      }
      
      const slot = element.data
      if (false) { // Old text slot code - no longer used
        // Render text slot
        const slotXmm = pageMarginMm + (slot.x / 100) * contentWidthMm
        const slotYmm = pageMarginMm + (slot.y / 100) * contentHeightMm
        const slotWmm = (slot.width / 100) * contentWidthMm
        const slotHmm = (slot.height / 100) * contentHeightMm

        // Apply per-slot inner margin
        const innerP = Math.max(0, Math.min(50, Number(slot.innerMarginPercent) || 0)) / 100
        const contentXmm = slotXmm + slotWmm * innerP
        const contentYmm = slotYmm + slotHmm * innerP
        const contentWmm = Math.max(0, slotWmm * (1 - 2 * innerP))
        const contentHmm = Math.max(0, slotHmm * (1 - 2 * innerP))

        const style = slot.textStyle || {}
        
        // Set background if not transparent
        if (style.backgroundColor && style.backgroundColor !== 'transparent') {
          const bgColor = style.backgroundColor
          const r = parseInt(bgColor.slice(1, 3), 16)
          const g = parseInt(bgColor.slice(3, 5), 16)
          const b = parseInt(bgColor.slice(5, 7), 16)
          pdf.setFillColor(r, g, b)
          pdf.rect(contentXmm, contentYmm, contentWmm, contentHmm, 'F')
        }

        // Set text properties
        const fontFamily = mapFontToPdf(style.fontFamily || 'Inter')
        pdf.setFont(fontFamily, getPdfFontWeight(style.fontWeight))
        
        // Convert font size from px to mm based on page dimensions
        // Use the same conversion as the canvas display
        const pageSizePx = toPx(zineConfig.height, zineConfig.unit)
        const fontSizeRatio = (style.fontSize || 16) / pageSizePx
        const fontSize = fontSizeRatio * height // height is already in mm
        pdf.setFontSize(fontSize)
        
        const textColor = style.color || '#000000'
        const r = parseInt(textColor.slice(1, 3), 16)
        const g = parseInt(textColor.slice(3, 5), 16)
        const b = parseInt(textColor.slice(5, 7), 16)
        pdf.setTextColor(r, g, b)

        // Apply padding
        const paddingMm = ((style.padding || 20) * 0.264583)
        const textXmm = contentXmm + paddingMm
        const textYmm = contentYmm + paddingMm
        const textWmm = Math.max(0, contentWmm - 2 * paddingMm)

        // Split text into lines and render
        const lineHeight = (style.lineHeight || 1.5) * fontSize
        const lines = pdf.splitTextToSize(slot.textContent, textWmm)
        
        let currentY = textYmm
        lines.forEach((line, index) => {
          if (currentY + lineHeight <= contentYmm + contentHmm) {
            const align = style.textAlign || 'left'
            let xPos = textXmm
            
            if (align === 'center') {
              xPos = textXmm + textWmm / 2
            } else if (align === 'right') {
              xPos = textXmm + textWmm
            }
            
            pdf.text(line, xPos, currentY + fontSize, { align })
            currentY += lineHeight
          }
        })
      } else if (slot.assetId) {
        const imageUrl = getAssetUrl(slot.assetId)
        if (imageUrl) {
          try {
            const img = await loadImage(imageUrl)

            // Calculate slot dimensions within content area (mm)
            const slotXmm = pageMarginMm + (slot.x / 100) * contentWidthMm
            const slotYmm = pageMarginMm + (slot.y / 100) * contentHeightMm
            const slotWmm = (slot.width / 100) * contentWidthMm
            const slotHmm = (slot.height / 100) * contentHeightMm

            // Apply per-slot inner margin (absolute pixels converted to mm)
            const marginPx = Math.max(0, Math.min(200, Number(slot.innerMarginPx) || 0))
            const marginMm = marginPx * 0.264583 // px to mm
            
            const contentXmm = slotXmm + marginMm
            const contentYmm = slotYmm + marginMm
            const contentWmm = Math.max(0, slotWmm - 2 * marginMm)
            const contentHmm = Math.max(0, slotHmm - 2 * marginMm)

            // Render with fit mode using offscreen canvas then place result
            // Use higher DPI for better quality (300 DPI = ~11.8 px/mm)
            const pxPerMm = 11.8
            const canvasW = Math.max(1, Math.round(contentWmm * pxPerMm))
            const canvasH = Math.max(1, Math.round(contentHmm * pxPerMm))
            const canvas = document.createElement('canvas')
            canvas.width = canvasW
            canvas.height = canvasH
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvasW, canvasH)

            const imgW = img.naturalWidth || img.width
            const imgH = img.naturalHeight || img.height
            const slotRatio = canvasW / canvasH
            const imgRatio = imgW / imgH

            let sx, sy, sW, sH
            if (slot.fit === 'contain') {
              // Contain: no cropping, fit entire image inside canvas
              let drawW, drawH
              if (imgRatio > slotRatio) {
                // image wider than slot
                drawW = canvasW
                drawH = Math.round(canvasW / imgRatio)
              } else {
                drawH = canvasH
                drawW = Math.round(canvasH * imgRatio)
              }
              const dx = Math.round((canvasW - drawW) / 2)
              const dy = Math.round((canvasH - drawH) / 2)
              ctx.drawImage(img, 0, 0, imgW, imgH, dx, dy, drawW, drawH)
            } else {
              // Cover: crop the image to fill the canvas
              if (imgRatio > slotRatio) {
                // source is wider; crop width
                sH = imgH
                sW = Math.round(imgH * slotRatio)
                sx = Math.round((imgW - sW) / 2)
                sy = 0
              } else {
                // source is taller; crop height
                sW = imgW
                sH = Math.round(imgW / slotRatio)
                sx = 0
                sy = Math.round((imgH - sH) / 2)
              }
              ctx.drawImage(img, sx, sy, sW, sH, 0, 0, canvasW, canvasH)
            }

            const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
            pdf.addImage(dataUrl, 'JPEG', contentXmm, contentYmm, contentWmm, contentHmm)
          } catch (error) {
            console.error('Error loading image:', error)
          }
        }
      }
    }
  }

  // Save the PDF
  const fileName = `zine_${Date.now()}.pdf`
  pdf.save(fileName)
}

