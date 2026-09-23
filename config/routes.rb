Rails.application.routes.draw do
  resource :session, only: %i[ show create destroy ]
  resource :registration, only: %i[ create ]
  resources :passwords, param: :token, only: %i[ create edit update ]

  resources :sedes, only: %i[ index show create update destroy ]
  resources :espacios, only: %i[ index show create update destroy ]
  resources :reservas, only: %i[ index show create update destroy ]

  # Health check por defecto de Rails (200 si la app bootea sin excepciones).
  get "up" => "rails/health#show", as: :rails_health_check

  # Health check propio, usado por el pipeline de Jenkins.
  get "health" => "health#show", as: :health
end
