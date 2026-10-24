import {createContext,useContext} from 'react'
export const RecommendationContext=createContext(null)
export const useRecommendationSession=()=>useContext(RecommendationContext)
