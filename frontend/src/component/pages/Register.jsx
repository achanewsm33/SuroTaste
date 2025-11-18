import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '/src/utils/api';

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await auth.register({ name: username, email, password });

      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        if (response.user.role === 'admin') navigate('/admin');
        else navigate('/profile'); // / profile atau home, tergantung rute
      } else {
        // kalau backend tidak mengembalikan token, arahkan ke login
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <main className="regist-bg flex flex-col items-center justify-center px-6 rounded shadow">
      <div className="w-[500px] py-5 sm:px-6 lg:px-12 bg-gray-50 rounded-[20px]">
        <h2 className="my-6 text-center text-3xl font-extrabold text-gray-900">
          Create New Account
        </h2>
           

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 text-placeholder-form border-line border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="your username"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 text-placeholder-form border-line border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 text-placeholder-form border-line border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="enter your password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 text-placeholder-form border-line border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="confirm your password"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-md text-white bg-primary-green hover:bg-secondary disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>
          </div>

          <div className="text-center text-sm">
            <span>Already have an account? </span>
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={() => {
                if (typeof navigate === "function") navigate("/login");
                else window.location.href = "/login";
              }}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
