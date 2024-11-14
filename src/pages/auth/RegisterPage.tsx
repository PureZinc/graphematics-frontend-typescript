import { useState, useContext } from "react";
import AuthContext from "../../services/Auth";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { register } = useContext(AuthContext) || { register: () => Promise<void> };

  const success = "User Successfully Created!";

  const errorDecoration = error === success ? "text-green-500" : "text-red-500";
  
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await register(formData); // Call the login function from AuthContext
      setError(success);
    } catch (err: any) {
      setError(err.message); // Set error if login fails
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card w-full max-w-sm shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-center text-2xl">Register</h2>

          <form onSubmit={handleRegister}>
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
                Register
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <a href="/login" className="link link-primary">
              Already have an account? Login Here.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
