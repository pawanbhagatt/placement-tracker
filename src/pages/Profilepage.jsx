import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../api/profileApi";
import { useNavigate } from "react-router-dom";

export default function Profilepage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    college: "",
    cgpa: "",
    branch: "",
    graduationYear: "",
    bio: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        if (!user || !user.token) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        console.log("Loading profile with token:", user.token);
        const profileData = await getProfile(user.token);
        console.log("Profile data received:", profileData);

        if (profileData) {
          setForm({
            name: profileData.name || "",
            email: profileData.email || "",
            phone: profileData.phone || "",
            address: profileData.address || "",
            city: profileData.city || "",
            state: profileData.state || "",
            college: profileData.college || "",
            cgpa: profileData.cgpa || "",
            branch: profileData.branch || "",
            graduationYear: profileData.graduationYear || "",
            bio: profileData.bio || "",
          });
        }
      } catch (e) {
        console.error("Profile loading error:", e);
        setError(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await updateProfile(form, user.token);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (e) {
      setError(e.message);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (loading) return <div style={{ padding: "20px" }}>Loading profile...</div>;

  if (!user) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <p>Please log in to view your profile.</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2>My Profile</h2>
        <button onClick={handleLogout} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {error && <div style={{ color: "red", marginBottom: "15px", padding: "10px", backgroundColor: "#f8d7da", borderRadius: "4px" }}>Error: {error}</div>}
      {success && <div style={{ color: "green", marginBottom: "15px", padding: "10px", backgroundColor: "#d4edda", borderRadius: "4px" }}>✓ {success}</div>}

      {!isEditing ? (
        <div>
          <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
            <h3>Personal Information</h3>
            <p><strong>Name:</strong> {form.name || "Not provided"}</p>
            <p><strong>Email:</strong> {form.email || "Not provided"}</p>
            <p><strong>Phone:</strong> {form.phone || "Not provided"}</p>
            <p><strong>City:</strong> {form.city || "Not provided"}</p>
            <p><strong>State:</strong> {form.state || "Not provided"}</p>
            <p><strong>Address:</strong> {form.address || "Not provided"}</p>
          </div>

          <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
            <h3>Academic Information</h3>
            <p><strong>College:</strong> {form.college || "Not provided"}</p>
            <p><strong>Branch:</strong> {form.branch || "Not provided"}</p>
            <p><strong>CGPA:</strong> {form.cgpa || "Not provided"}</p>
            <p><strong>Graduation Year:</strong> {form.graduationYear || "Not provided"}</p>
          </div>

          <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
            <h3>Bio</h3>
            <p>{form.bio || "No bio provided"}</p>
          </div>

          <button onClick={() => setIsEditing(true)} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: "20px" }}>Edit Personal Information</h3>
          <div style={{ marginBottom: "15px" }}>
            <label><strong>Name</strong></label>
            <input name="name" value={form.name} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label><strong>Email</strong></label>
            <input name="email" type="email" value={form.email} disabled style={{ width: "100%", padding: "8px", marginTop: "5px", backgroundColor: "#e9ecef" }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label><strong>Phone</strong></label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g., 9876543210" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label><strong>City</strong></label>
            <input name="city" value={form.city} onChange={handleChange} placeholder="e.g., Mumbai" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label><strong>State</strong></label>
            <input name="state" value={form.state} onChange={handleChange} placeholder="e.g., Maharashtra" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label><strong>Address</strong></label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="e.g., 123 Main St" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
          </div>

          <h3 style={{ marginBottom: "20px", marginTop: "30px" }}>Edit Academic Information</h3>
          <div style={{ marginBottom: "15px" }}>
            <label><strong>College</strong></label>
            <input name="college" value={form.college} onChange={handleChange} placeholder="e.g., IIT Bombay" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label><strong>Branch</strong></label>
            <input name="branch" value={form.branch} onChange={handleChange} placeholder="e.g., Computer Science" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label><strong>CGPA</strong></label>
            <input name="cgpa" type="number" step="0.01" value={form.cgpa} onChange={handleChange} placeholder="e.g., 8.5" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label><strong>Graduation Year</strong></label>
            <input name="graduationYear" type="number" value={form.graduationYear} onChange={handleChange} placeholder="e.g., 2024" style={{ width: "100%", padding: "8px", marginTop: "5px" }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label><strong>Bio</strong></label>
            <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Tell us about yourself..." style={{ width: "100%", padding: "8px", marginTop: "5px", minHeight: "100px" }} />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Save Changes
            </button>
            <button type="button" onClick={() => setIsEditing(false)} style={{ marginLeft: "10px", padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
