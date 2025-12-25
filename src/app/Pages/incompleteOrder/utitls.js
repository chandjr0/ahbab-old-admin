export function formatDate(dateString) {
    const date = new Date(dateString)
    const month = date.toLocaleString("default", { month: "short" })
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "pm" : "am"
    const formattedHours = hours % 12 || 12
  
    return `${month} ${day}, ${formattedHours}:${minutes} ${ampm}`
  }
  
  export function cn(...classes) {
    return classes.filter(Boolean).join(" ")
  }
  
  