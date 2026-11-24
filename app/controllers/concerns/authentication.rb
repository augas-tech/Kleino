module Authentication
  extend ActiveSupport::Concern

  included do
    include ActionController::HttpAuthentication::Token::ControllerMethods
    before_action :require_authentication
  end

  class_methods do
    def allow_unauthenticated_access(**options)
      skip_before_action :require_authentication, **options
    end
  end

  private
    def authenticated?
      resume_session
    end

    def require_authentication
      resume_session || request_authentication
    end

    def resume_session
      Current.session ||= find_session_by_cookie || find_session_by_bearer
    end

    def find_session_by_cookie
      Session.find_by(id: cookies.signed[:session_id]) if cookies.signed[:session_id]
    end

    def find_session_by_bearer
      authenticate_with_http_token { |token, _options| Session.find_by(token: token) }
    end

    def mobile_client?
      request.headers["X-Client"] == "mobile"
    end

    # Respuesta de login y registro: solo el móvil recibe el token.
    def session_payload(user)
      payload = { user: user.as_public_json }
      payload[:token] = Current.session.token if mobile_client?
      payload
    end

    def request_authentication
      render json: { error: "Debes iniciar sesión" }, status: :unauthorized
    end

    def start_new_session_for(user)
      user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip).tap do |session|
        Current.session = session
        unless mobile_client?
          cookies.signed.permanent[:session_id] = { value: session.id, httponly: true, same_site: :lax, secure: Rails.env.production? }
        end
      end
    end

    def terminate_session
      Current.session.destroy
      cookies.delete(:session_id)
    end
end
