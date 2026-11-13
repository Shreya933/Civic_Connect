// frontend/src/pages/admin/PendingComplaints.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, AlertCircle, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import ComplaintTable from '../../components/ComplaintTable';
import Loader from '../../components/Loader';
import { adminApi } from '../../api/adminApi';

export const PendingComplaints = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingComplaints, setPendingComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await adminApi.getPendingComplaints();
        setPendingComplaints(res.data || []);
      } catch (err) {
        console.error('Failed to load pending complaints:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleReviewAction = (complaint) => {
    navigate('/admin/review', { state: { complaint } });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="Pending Review Queue"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          <div className="dashboard-page-header">
            <div className="dashboard-header-text">
              <h1>Pending Complaints for Review</h1>
              <p>
                Evaluate AI-detected categories, verify photo legitimacy, and assign responsible departments, field crews, and deadlines.
              </p>
            </div>
          </div>

          {loading ? (
            <Loader fullPage message="Loading pending queue..." />
          ) : (
            <ComplaintTable
              complaints={pendingComplaints}
              onRowAction={handleReviewAction}
              actionLabel="Review & Assign"
              showCitizenInfo={true}
              showReportId={false}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default PendingComplaints;

