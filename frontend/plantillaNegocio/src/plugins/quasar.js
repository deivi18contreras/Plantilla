import { Quasar, Notify, Loading } from 'quasar'

import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'

import 'quasar/src/css/index.sass'

export default {
  install: (app) => {
    app.use(Quasar, {
      plugins: { Notify, Loading },
      config: {
        dark: false, // Modo claro por defecto
        notify: {
          position: 'top-right',
          timeout: 2500,
          textColor: 'dark',
          actions: [{ icon: 'close', color: 'dark' }]
        },
        loading: {
          spinnerColor: 'primary'
        }
      }
    })
  }
}
