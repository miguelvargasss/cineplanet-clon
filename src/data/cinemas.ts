// 🎬 DATOS DE CINES CINEPLANET EN LIMA

import { Cinema } from '../types';

export const limecinemas: Cinema[] = [
  {
    id: 'cp-alcazar',
    name: 'CP Alcazar',
    address: 'Av. Santa Cruz 814-816 Miraflores Lima Lima',
    city: 'Lima',
    coordinates: {
      latitude: -12.1184,
      longitude: -77.0296
    }
  },
  {
    id: 'cp-arequipa-mall-plaza',
    name: 'CP Arequipa Mall Plaza',
    address: 'Av. Ejercito 793 Cayma Cayma Arequipa Arequipa',
    city: 'Arequipa',
    coordinates: {
      latitude: -16.3864,
      longitude: -71.5692
    }
  },
  {
    id: 'cp-arequipa-real-plaza',
    name: 'CP Arequipa Real Plaza',
    address: 'Av. Ejercito 1009 Cayma Cayma Arequipa Arequipa',
    city: 'Arequipa',
    coordinates: {
      latitude: -16.3888,
      longitude: -71.5671
    }
  },
  {
    id: 'cp-brasil',
    name: 'CP Brasil',
    address: 'Av. Brasil 714 - 792 Piso 3  Breña Lima Lima',
    city: 'Lima',
    coordinates: {
      latitude: -12.0583,
      longitude: -77.0508
    }
  },
  {
    id: 'cp-centro-civico',
    name: 'CP Centro Civico',
    address: 'Jr. Carlos Zavala 148 Lima Lima Lima',
    city: 'Lima',
    coordinates: {
      latitude: -12.0547,
      longitude: -77.0442
    }
  },
  {
    id: 'cp-la-rambla',
    name: 'CP La Rambla',
    address: 'Av. Faucett 3250 San Miguel Lima Lima',
    city: 'Lima',
    coordinates: {
      latitude: -12.0753,
      longitude: -77.0925
    }
  },
  {
    id: 'cp-san-miguel',
    name: 'CP San Miguel',
    address: 'Av. La Marina 2355 San Miguel Lima Lima',
    city: 'Lima',
    coordinates: {
      latitude: -12.0771,
      longitude: -77.0869
    }
  },
  {
    id: 'cp-megaplaza',
    name: 'CP Megaplaza',
    address: 'Av. Alfredo Mendiola 3698 Independencia Lima Lima',
    city: 'Lima',
    coordinates: {
      latitude: -11.9885,
      longitude: -77.0621
    }
  }
];

// Función para obtener un cine por ID
export const getCinemaById = (cinemaId: string): Cinema | undefined => {
  return limecinemas.find(cinema => cinema.id === cinemaId);
};

// Función para obtener cines por ciudad
export const getCinemasByCity = (city: string): Cinema[] => {
  return limecinemas.filter(cinema => 
    cinema.city.toLowerCase() === city.toLowerCase()
  );
};