import React, { useState } from 'react';
 import { Plus, Trash2, ArrowLeft } from 'lucide-react';
 import { useNavigate } from 'react-router-dom';
 import axios from "axios";

 interface URL {
  url: string;
 }

 interface AttackerInfo {
  attackerName: string;
  email: string;
  toxId: string;
  sessionId: string;
  description: string;
  isRaas: boolean;
  monitorStatus: boolean;
 }

 interface AttackerForm {
  attacker: AttackerInfo;
  urls: URL[];
 }

 function AddAttacker() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AttackerForm>({
   attacker: {
    attackerName: '',
    email: '',
    toxId: '',
    sessionId: '',
    description: '',
    isRaas: false,
    monitorStatus: true, // Default to true
   },
   urls: [{ url: '' }],
  });
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
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

  const handleAttackerInfoChange = (field: keyof AttackerInfo, value: any) => {
   setFormData(prev => ({
    ...prev,
    attacker: {
     ...prev.attacker,
     [field]: value,
    },
   }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setMessage(null);
   setLoading(true);

   const requestBody = {
    attacker: formData.attacker,
    urls: formData.urls.map(urlObj => urlObj.url),
   };

   try {
    const response = await axios.post("http://localhost:3000/server/ransommonitor/addAttacker", requestBody, {
     headers: {
      "Content-Type": "application/json",
     },
    });

    if (response.status === 200) {
     setMessage({ text: "Attacker added successfully!", type: 'success' });
     setTimeout(() => navigate("/app/monitor"), 500);
    }
   } catch (error) {
    console.error("Error submitting form:", error);
    setMessage({ text: "Failed to add attacker.", type: 'error' });
   } finally {
    setLoading(false);
   }
  };

  return (
   <div className="container mx-auto p-6 max-w-lg">
    <button
     onClick={() => navigate('/app/monitor')}
     className="btn btn-link flex items-center mb-6"
    >
     <ArrowLeft className="icon-sm mr-2" />
     Back to Monitor
    </button>

    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
     <h1 className="text-xl font-semibold text-gray-900 mb-6">Add New Attacker</h1>

     {message && (
      <div
       className={`mb-4 p-3 rounded-md ${
        message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
       }`}
       role="alert"
      >
       {message.text}
      </div>
     )}

     <form onSubmit={handleSubmit}>
      <div className="mb-4">
       <label htmlFor="attackerName" className="block text-gray-700 text-sm font-bold mb-2">
        Attacker Name
       </label>
       <input
        type="text"
        id="attackerName"
        value={formData.attacker.attackerName}
        onChange={(e) => handleAttackerInfoChange('attackerName', e.target.value)}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        required
        disabled={loading}
       />
      </div>

      <div className="mb-4">
       <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
        Email
       </label>
       <input
        type="email"
        id="email"
        value={formData.attacker.email}
        onChange={(e) => handleAttackerInfoChange('email', e.target.value)}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        disabled={loading}
       />
      </div>

      <div className="mb-4">
       <label htmlFor="toxId" className="block text-gray-700 text-sm font-bold mb-2">
        Tox ID
       </label>
       <input
        type="text"
        id="toxId"
        value={formData.attacker.toxId}
        onChange={(e) => handleAttackerInfoChange('toxId', e.target.value)}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        disabled={loading}
       />
      </div>

      <div className="mb-4">
       <label htmlFor="sessionId" className="block text-gray-700 text-sm font-bold mb-2">
        Session ID
       </label>
       <input
        type="text"
        id="sessionId"
        value={formData.attacker.sessionId}
        onChange={(e) => handleAttackerInfoChange('sessionId', e.target.value)}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        disabled={loading}
       />
      </div>

      <div className="mb-4">
       <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
        Description
       </label>
       <textarea
        id="description"
        value={formData.attacker.description}
        onChange={(e) => handleAttackerInfoChange('description', e.target.value)}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        rows={3}
        disabled={loading}
       />
      </div>

      <div className="mb-4 flex items-center">
       <input
        type="checkbox"
        id="isRaas"
        checked={formData.attacker.isRaas}
        onChange={(e) => handleAttackerInfoChange('isRaas', e.target.checked)}
        className="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        disabled={loading}
       />
       <label htmlFor="isRaas" className="ml-2 block text-gray-700 text-sm font-bold">
        isRaas
       </label>
      </div>

      <div className="mb-4 flex items-center">
       <input
        type="checkbox"
        id="monitorStatus"
        checked={formData.attacker.monitorStatus}
        onChange={(e) => handleAttackerInfoChange('monitorStatus', e.target.checked)}
        className="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        disabled={loading}
       />
       <label htmlFor="monitorStatus" className="ml-2 block text-gray-700 text-sm font-bold">
        Monitor Status
       </label>
      </div>

      <div className="mb-4">
       <div className="flex justify-between items-center mb-2">
        <label className="block text-gray-700 text-sm font-bold">URLs</label>
        <button
         type="button"
         onClick={addUrlField}
         className="btn btn-link"
         disabled={loading}
        >
         <Plus className="icon-sm mr-1" />
         Add URL
        </button>
       </div>

       {formData.urls.map((url, index) => (
        <div key={index} className="flex items-center gap-2 mb-3">
         <input
          type="text"
          value={url.url}
          onChange={(e) => handleUrlChange(index, e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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