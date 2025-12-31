/**
 * Notification Composable
 * Provides easy access to toast notifications and confirm dialogs
 */

let toastInstance = null
let confirmInstance = null

export function setToastInstance(instance) {
  toastInstance = instance
}

export function setConfirmInstance(instance) {
  confirmInstance = instance
}

export function useNotification() {
  const toast = {
    success(message, title = null, duration = 4000) {
      if (!toastInstance) {
        console.warn('Toast instance not initialized')
        return
      }
      return toastInstance.addToast(message, 'success', title, duration)
    },
    
    error(message, title = null, duration = 5000) {
      if (!toastInstance) {
        console.warn('Toast instance not initialized')
        return
      }
      return toastInstance.addToast(message, 'error', title, duration)
    },
    
    warning(message, title = null, duration = 4000) {
      if (!toastInstance) {
        console.warn('Toast instance not initialized')
        return
      }
      return toastInstance.addToast(message, 'warning', title, duration)
    },
    
    info(message, title = null, duration = 4000) {
      if (!toastInstance) {
        console.warn('Toast instance not initialized')
        return
      }
      return toastInstance.addToast(message, 'info', title, duration)
    },
    
    remove(id) {
      if (toastInstance) {
        toastInstance.removeToast(id)
      }
    },
    
    clearAll() {
      if (toastInstance) {
        toastInstance.clearAll()
      }
    }
  }

  async function confirm(message, options = {}) {
    if (!confirmInstance) {
      console.warn('Confirm instance not initialized, falling back to native confirm')
      return window.confirm(message)
    }
    
    return confirmInstance.open({
      message,
      title: options.title,
      type: options.type || 'info',
      icon: options.icon,
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel'
    })
  }

  return {
    toast,
    confirm
  }
}
