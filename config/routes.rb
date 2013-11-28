GoldDigger::Application.routes.draw do
  # main home page
  root to: 'static_pages#home'

  # static pages
  match '/about', to: 'static_pages#about', via: [:get], as: 'about'
  match '/algorithm', to: 'static_pages#algorithm', via: [:get], as: 'algorithm'

  # Simulator
  match '/simulation', to: 'simulator#simulation', via: [:get], as: 'simulation'
end
