import {app} from './app.js'
import 'dotenv/config'
import {connectDB} from './db/index.js'

const port = process.env.PORT || 8000

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server started on PORT ${port}`)
    })
})
