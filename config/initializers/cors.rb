# Origenes permitidos para peticiones cross-origin (el frontend vive en otro dominio).
# En desarrollo Vite sirve en localhost:5173/5174; en produccion el pipeline de Jenkins
# pasa CORS_ORIGINS=https://kleino.frubilarz.cl al contenedor. Varios origenes: separados por coma.
# La sesion va en una cookie, asi que se necesita credentials: true (y origenes explicitos, nunca "*").
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174").split(",").map(&:strip)

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      credentials: true
  end
end
