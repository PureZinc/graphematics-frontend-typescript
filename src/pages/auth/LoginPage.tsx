import { useState, useContext } from "react";
import AuthContext from "../../services/Auth";

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext) || { login: () => Promise<void> };

  const success = "Login Successful!";

  const errorDecoration = error === success ? "text-green-500" : "text-red-500";


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(formData); // Call the login function from AuthContext
      setError(success);
    } catch (err: any) {
      setError(err.message); // Set error if login fails
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card w-full max-w-sm shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-center text-2xl">Login</h2>

          <form onSubmit={handleLogin}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                placeholder="Username"
                className="input input-bordered"
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Password"
                className="input input-bordered"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div className="form-control mb-4">
                <p className={errorDecoration}>{error}</p>
              </div>
            )}

            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary">
                Login
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <a href="/register" className="link link-primary">
              Don’t have an account? Register
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;