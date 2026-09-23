# Be sure to restart your server when you modify this file.

# Permite que el frontend React (otro origen) consuma la API usando cookies.
# Los orígenes permitidos se configuran con FRONTEND_ORIGINS (separados por coma).
# Con `credentials: true` no se puede usar "*": deben ser orígenes explícitos.
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("FRONTEND_ORIGINS", "http://localhost:5173").split(",").map(&:strip)

    resource "*",
      headers: :any,
      methods: %i[ get post put patch delete options head ],
      credentials: true
  end
end
