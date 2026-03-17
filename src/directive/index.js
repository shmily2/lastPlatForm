import permission from './permission'
import { role } from './permission'

export default function setupDirectives(app) {
  app.directive('permission', permission)
  app.directive('role', role)
}
