# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_11_22_120200) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "espacios", force: :cascade do |t|
    t.integer "capacidad"
    t.datetime "created_at", null: false
    t.text "descripcion"
    t.string "estado", default: "activo"
    t.time "hora_apertura"
    t.time "hora_cierre"
    t.string "nombre", null: false
    t.bigint "sede_id", null: false
    t.string "tipo"
    t.string "ubicacion"
    t.datetime "updated_at", null: false
    t.index ["sede_id"], name: "index_espacios_on_sede_id"
    t.check_constraint "capacidad > 0", name: "capacidad_positiva"
    t.check_constraint "hora_apertura IS NULL AND hora_cierre IS NULL OR hora_apertura IS NOT NULL AND hora_cierre IS NOT NULL AND hora_cierre > hora_apertura", name: "horario_valido"
  end

  create_table "reservas", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "espacio_id", null: false
    t.string "estado", default: "pendiente"
    t.date "fecha", null: false
    t.time "hora_fin", null: false
    t.time "hora_inicio", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["espacio_id", "fecha"], name: "index_reservas_on_espacio_id_and_fecha"
    t.index ["espacio_id"], name: "index_reservas_on_espacio_id"
    t.index ["user_id"], name: "index_reservas_on_user_id"
  end

  create_table "sedes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "direccion"
    t.string "nombre", null: false
    t.bigint "propietario_id"
    t.datetime "updated_at", null: false
    t.index ["propietario_id"], name: "index_sedes_on_propietario_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email_address", null: false
    t.string "password_digest", null: false
    t.string "rol", default: "usuario", null: false
    t.datetime "updated_at", null: false
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
    t.check_constraint "rol::text = ANY (ARRAY['usuario'::character varying, 'administrador'::character varying]::text[])", name: "rol_valido"
  end

  add_foreign_key "espacios", "sedes"
  add_foreign_key "reservas", "espacios"
  add_foreign_key "reservas", "users"
  add_foreign_key "sedes", "users", column: "propietario_id"
  add_foreign_key "sessions", "users"
end
