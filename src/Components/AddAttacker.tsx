import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

interface URL {
  url: string;
}

interface AttackerForm {
  name: string;
  urls: URL[];
}

function AddAttacker() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AttackerForm>({
    name: '',
    urls: [{ url: '' }],
  });
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);

  const addUrlField = () => {
    setFormData(prev => ({
      ...prev,
      urls: [...prev.urls, { url: '' }],
    }));
  };

  const removeUrlField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index),
    }));
  };

  const handleUrlChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      urls: prev.urls.map((url, i) => (i === index ? { url: value } : url)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const requestBody = {
      attackerName: formData.name,
      urls: formData.urls.map(urlObj => urlObj.url),
    };

    try {
      const response = await axios.post("http://localhost:3000/server/ransommonitor/addAttacker", requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.status === 200) {
        setMessage({text: "Attacker added successfully!", type: 'success'});
        setTimeout(() => navigate("/app"), 1500);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <button
        onClick={() => navigate('/app')}
        className="btn btn-link flex items-center mb-6"
      >
        <ArrowLeft className="icon-sm" />
        Back to Monitor
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Add New Attacker</h1>

        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Attacker Name
            </label>
            <div className="flex justify-between items-center mb-6">
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center mb-6">
              <label className="form-label">URLs</label>
              <button
                type="button"
                onClick={addUrlField}
                className="btn btn-link"
                disabled={loading}
              >
                <Plus className="icon-sm" />
                Add URL
              </button>
            </div>

            {formData.urls.map((url, index) => (
              <div key={index} className="flex items-center gap-2 mb-6">
                <input
                  type="text"
                  value={url.url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  className="form-input"
                  placeholder="Enter URL"
                  required
                  disabled={loading}
                />
                {formData.urls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeUrlField(index)}
                    className="btn btn-link text-red-600"
                    disabled={loading}
                  >
                    <Trash2 className="icon" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Attacker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAttacker;