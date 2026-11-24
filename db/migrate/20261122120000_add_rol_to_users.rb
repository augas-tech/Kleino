class AddRolToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :rol, :string, null: false, default: "usuario"
    add_check_constraint :users, "rol IN ('usuario', 'administrador')", name: "rol_valido"
  end
end
