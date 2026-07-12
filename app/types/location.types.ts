export interface Location {
  id: string
  name: string
  country: string
  city: string
  jobCount: number
  link?: string
}

export interface LocationsResponse {
  data: Location[]
  total: number
}
