// Quick test script to verify templates route
const express = require('express')
const templateRoutes = require('./routes/templates')

const app = express()
app.use(express.json())
app.use('/api/templates', templateRoutes)

const PORT = 3999

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`)
  console.log(`Test: http://localhost:${PORT}/api/templates/books`)
  console.log(`Test: http://localhost:${PORT}/api/templates/covers`)
})
