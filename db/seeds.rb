# db/seeds.rb
#
# Datos de prueba para que el docente pueda probar Kleino sin necesidad
# de registrarse a mano. Idempotente: se puede correr varias veces
# (bin/rails db:seed) sin duplicar registros.

puts "== Sembrando datos de prueba =="

# --- Usuario de prueba ---
usuario = User.find_or_create_by!(email_address: "docente@kleino.cl") do |u|
  u.password = "kleino2026"
  u.password_confirmation = "kleino2026"
end
puts "Usuario: #{usuario.email_address} / clave: kleino2026"

# --- Administrador de prueba (dueño de la sede y de sus espacios) ---
admin = User.find_or_create_by!(email_address: "admin@kleino.cl") do |u|
  u.password = "kleino2026"
  u.password_confirmation = "kleino2026"
  u.rol = "administrador"
end
admin.update!(rol: "administrador") unless admin.administrador?
puts "Administrador: #{admin.email_address} / clave: kleino2026"

# --- Sede ---
sede = Sede.find_or_create_by!(nombre: "Sede Central") do |s|
  s.direccion = "Av. Libertador Bernardo O'Higgins 1234, Santiago"
  s.propietario = admin
end
# Si la sede ya existía (de antes de los roles), se le asigna el dueño.
sede.update!(propietario: admin) if sede.propietario.nil?
puts "Sede: #{sede.nombre}"

# --- Espacios ---
espacios = [
  {
    nombre: "Sala de Reuniones A",
    tipo: "sala_reunion",
    capacidad: 8,
    ubicacion: "Piso 2",
    descripcion: "Sala con proyector y pizarra",
    estado: "activo",
    hora_apertura: "08:00",
    hora_cierre: "20:00"
  },
  {
    nombre: "Cancha Techada",
    tipo: "cancha",
    capacidad: 10,
    ubicacion: "Patio central",
    descripcion: "Cancha multiuso techada",
    estado: "activo",
    hora_apertura: "08:00",
    hora_cierre: "20:00"
  }
]

espacios.each do |datos|
  espacio = Espacio.find_or_create_by!(nombre: datos[:nombre], sede: sede) do |e|
    e.tipo = datos[:tipo]
    e.capacidad = datos[:capacidad]
    e.ubicacion = datos[:ubicacion]
    e.descripcion = datos[:descripcion]
    e.estado = datos[:estado]
    e.hora_apertura = datos[:hora_apertura]
    e.hora_cierre = datos[:hora_cierre]
  end
  # Si el espacio ya existía (de antes del horario), se le agrega.
  espacio.update!(hora_apertura: datos[:hora_apertura], hora_cierre: datos[:hora_cierre]) unless espacio.horario_definido?
  puts "Espacio: #{espacio.nombre} (#{espacio.capacidad} personas)"
end
# --- Reservas de ejemplo ---
sala_reuniones = Espacio.find_by!(nombre: "Sala de Reuniones A")

reservas = [
  { fecha: Date.tomorrow, hora_inicio: "10:00", hora_fin: "11:00", estado: "pendiente" },
  { fecha: Date.tomorrow, hora_inicio: "14:00", hora_fin: "15:00", estado: "aprobada" }
]

reservas.each do |datos|
  reserva = Reserva.find_or_create_by!(
    user: usuario,
    espacio: sala_reuniones,
    fecha: datos[:fecha],
    hora_inicio: datos[:hora_inicio]
  ) do |r|
    r.hora_fin = datos[:hora_fin]
    r.estado = datos[:estado]
  end
  puts "Reserva: #{reserva.fecha} #{reserva.hora_inicio.strftime('%H:%M')}-#{reserva.hora_fin.strftime('%H:%M')} (#{reserva.estado})"
end
puts "== Listo =="
