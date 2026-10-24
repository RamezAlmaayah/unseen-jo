import { TreePine, Landmark, Mountain, Amphora, Utensils, Camera, Users, MapPin } from 'lucide-react'

export const markerCategories = {
  nature: { color: '#164F3F', Icon: TreePine }, history: { color: '#A5472D', Icon: Landmark },
  adventure: { color: '#826421', Icon: Mountain }, culture: { color: '#815A42', Icon: Amphora },
  food: { color: '#B34C35', Icon: Utensils }, photography: { color: '#476E75', Icon: Camera },
  family: { color: '#4D6842', Icon: Users },
}
export const markerCategory = place => markerCategories[place.categoryId] ?? { color: '#164F3F', Icon: MapPin }
