import { candidatesHandlers } from './candidates.handlers'
import { locationsHandlers } from './locations.handlers'
import { templatesHandlers } from './templates.handlers'
import { stubHandlers } from './stub.handlers'

export const handlers = [
  ...candidatesHandlers,
  ...locationsHandlers,
  ...templatesHandlers,
  ...stubHandlers,
]
