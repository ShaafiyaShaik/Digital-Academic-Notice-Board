import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";

const AcademicStructure = ({ darkMode, permissions }) => {
  const [activeTab, setActiveTab] = useState("departments");
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachingAssignments, setTeachingAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Form states
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
  
  const [showClassForm, setShowClassForm] = useState(false);
  const [classForm, setClassForm] = useState({ departmentId: '', year: '', section: '' });
  
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', description: '', departmentId: '', year: '' });
  
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ teacherId: '', subjectId: '', classIds: [] });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAllData();
    // Set initial tab based on permissions
    if (permissions) {
      if (!permissions.canManageDepartments && permissions.canManageDeptClasses) {
        setActiveTab("classes");
      }
    }
  }, [permissions]);

  const fetchAllData = async () => {
    try {
      const [deptsRes, classesRes, subjectsRes, assignRes, teachersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/departments', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/classes', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/subjects', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/teaching-assignments', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/users/teachers', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setDepartments(deptsRes.data);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
      setTeachingAssignments(assignRes.data);
      setTeachers(teachersRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Department handlers
  const handleAddDept = async () => {
    if (!deptForm.name || !deptForm.code) {
      alert('Name and code are required');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/departments', deptForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeptForm({ name: '', code: '', description: '' });
      setShowDeptForm(false);
      fetchAllData();
    } catch (error) {
      alert('Error creating department: ' + error.message);
    }
  };

  // Subject handlers
  const handleAddSubject = async () => {
    if (!subjectForm.name || !subjectForm.code || !subjectForm.departmentId || !subjectForm.year) {
      alert('Name, code, department, and year are required');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/subjects', subjectForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjectForm({ name: '', code: '', description: '', departmentId: '', year: '' });
      setShowSubjectForm(false);
      fetchAllData();
    } catch (error) {
      alert('Error creating subject: ' + error.message);
    }
  };

  // Class handlers
  const handleAddClass = async () => {
    if (!classForm.departmentId || !classForm.year || !classForm.section) {
      alert('All fields are required');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/classes', classForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClassForm({ departmentId: '', year: '', section: '' });
      setShowClassForm(false);
      fetchAllData();
    } catch (error) {
      alert('Error creating class: ' + error.message);
    }
  };

  // Teaching Assignment handler
  const handleAddAssignment = async () => {
    if (!assignmentForm.teacherId || !assignmentForm.subjectId || assignmentForm.classIds.length === 0) {
      alert('Teacher, subject, and at least one class are required');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/teaching-assignments', assignmentForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignmentForm({ teacherId: '', subjectId: '', classIds: [] });
      setShowAssignmentForm(false);
      fetchAllData();
    } catch (error) {
      alert('Error creating teaching assignment: ' + error.message);
    }
  };

  const cardStyle = {
    background: darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.9)",
    border: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
    color: darkMode ? "#e2e8f0" : "#1e293b"
  };

  const buttonStyle = {
    padding: "10px 16px",
    background: "linear-gradient(135deg, #6366f1, #22d3ee)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "12px"
  };

  const inputStyle = {
    padding: "10px",
    border: darkMode ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "6px",
    background: darkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
    color: darkMode ? "#e2e8f0" : "#1e293b",
    marginBottom: "10px",
    width: "100%"
  };

  return (
    <div>
      <h2 style={{
        fontSize: '28px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '24px'
      }}>
        🏫 Academic Structure
      </h2>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {/* Show tabs based on permissions */}
        {permissions && permissions.canManageDepartments && (
          <button
            onClick={() => setActiveTab('departments')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'departments' ? '#6366f1' : (darkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0'),
              color: activeTab === 'departments' ? '#fff' : (darkMode ? '#e2e8f0' : '#1e293b'),
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            Departments
          </button>
        )}
        
        {permissions && permissions.canManageDeptClasses && (
          <button
            onClick={() => setActiveTab('classes')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'classes' ? '#6366f1' : (darkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0'),
              color: activeTab === 'classes' ? '#fff' : (darkMode ? '#e2e8f0' : '#1e293b'),
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            Classes
          </button>
        )}
        
        {permissions && permissions.canManageDeptSubjects && (
          <button
            onClick={() => setActiveTab('subjects')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'subjects' ? '#6366f1' : (darkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0'),
              color: activeTab === 'subjects' ? '#fff' : (darkMode ? '#e2e8f0' : '#1e293b'),
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            Subjects
          </button>
        )}
        
        {permissions && permissions.canAssignDeptTeachers && (
          <button
            onClick={() => setActiveTab('assignments')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'assignments' ? '#6366f1' : (darkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0'),
              color: activeTab === 'assignments' ? '#fff' : (darkMode ? '#e2e8f0' : '#1e293b'),
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            Assignments
          </button>
        )}
      </div>

      {/* DEPARTMENTS */}
      {activeTab === 'departments' && permissions && permissions.canManageDepartments && (
        <div>
          <button onClick={() => setShowDeptForm(!showDeptForm)} style={buttonStyle}>
            <FaPlus /> Add Department
          </button>

          {showDeptForm && (
            <div style={{ ...cardStyle, marginBottom: '20px', marginTop: '16px' }}>
              <h3>Create Department</h3>
              <input
                type="text"
                placeholder="Department Name (e.g., Computer Science Engineering)"
                value={deptForm.name}
                onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Code (e.g., CSE)"
                value={deptForm.code}
                onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                style={inputStyle}
              />
              <textarea
                placeholder="Description (optional)"
                value={deptForm.description}
                onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                style={{ ...inputStyle, minHeight: '60px' }}
              />
              <button onClick={handleAddDept} style={buttonStyle}>
                <FaCheckCircle /> Create
              </button>
            </div>
          )}

          <div>
            {departments.map(dept => (
              <div key={dept._id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0' }}>{dept.name}</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Code: <strong>{dept.code}</strong>
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {departments.length === 0 && <p>No departments created yet.</p>}
          </div>
        </div>
      )}

      {/* SUBJECTS */}
      {activeTab === 'subjects' && (
        <div>
          <button onClick={() => setShowSubjectForm(!showSubjectForm)} style={buttonStyle}>
            <FaPlus /> Add Subject
          </button>

          {showSubjectForm && (
            <div style={{ ...cardStyle, marginBottom: '20px', marginTop: '16px' }}>
              <h3>Create Subject</h3>
              <select
                value={subjectForm.departmentId}
                onChange={(e) => setSubjectForm({ ...subjectForm, departmentId: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Department *</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
              <select
                value={subjectForm.year}
                onChange={(e) => setSubjectForm({ ...subjectForm, year: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Year *</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
              <input
                type="text"
                placeholder="Subject Name (e.g., Database Management Systems)"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Subject Code (e.g., DBMS)"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                style={inputStyle}
              />
              <textarea
                placeholder="Description (optional)"
                value={subjectForm.description}
                onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                style={{ ...inputStyle, minHeight: '60px' }}
              />
              <button onClick={handleAddSubject} style={buttonStyle}>
                <FaCheckCircle /> Create
              </button>
            </div>
          )}

          <div>
            {subjects.map(subject => (
              <div key={subject._id} style={cardStyle}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0' }}>{subject.name}</h3>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Code: <strong>{subject.code}</strong>
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Dept: <strong>{subject.departmentId?.name || 'N/A'}</strong> | Year: <strong>{subject.year}</strong>
                  </p>
                  {subject.description && (
                    <p style={{ margin: '4px 0', fontSize: '13px', color: darkMode ? '#cbd5e1' : '#475569' }}>
                      {subject.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {subjects.length === 0 && <p>No subjects created yet.</p>}
          </div>
        </div>
      )}

      {/* CLASSES */}
      {activeTab === 'classes' && (
        <div>
          <button onClick={() => setShowClassForm(!showClassForm)} style={buttonStyle}>
            <FaPlus /> Add Class
          </button>

          {showClassForm && (
            <div style={{ ...cardStyle, marginBottom: '20px', marginTop: '16px' }}>
              <h3>Create Class</h3>
              <select
                value={classForm.departmentId}
                onChange={(e) => setClassForm({ ...classForm, departmentId: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name} ({dept.code})</option>
                ))}
              </select>
              <select
                value={classForm.year}
                onChange={(e) => setClassForm({ ...classForm, year: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
              <input
                type="text"
                placeholder="Section (e.g., A, B, C)"
                value={classForm.section}
                onChange={(e) => setClassForm({ ...classForm, section: e.target.value.toUpperCase() })}
                style={inputStyle}
              />
              <button onClick={handleAddClass} style={buttonStyle}>
                <FaCheckCircle /> Create
              </button>
            </div>
          )}

          <div>
            {classes.map(cls => (
              <div key={cls._id} style={cardStyle}>
                <h3 style={{ margin: '0 0 6px 0' }}>{cls.name}</h3>
              </div>
            ))}
            {classes.length === 0 && <p>No classes created yet.</p>}
          </div>
        </div>
      )}

      {/* TEACHING ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div>
          <button onClick={() => setShowAssignmentForm(!showAssignmentForm)} style={buttonStyle}>
            <FaPlus /> Create Assignment
          </button>

          {showAssignmentForm && (
            <div style={{ ...cardStyle, marginBottom: '20px', marginTop: '16px' }}>
              <h3>Create Teaching Assignment</h3>
              <select
                value={assignmentForm.teacherId}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, teacherId: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Teacher</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
              <select
                value={assignmentForm.subjectId}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, subjectId: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
              <label style={{ display: 'block', marginBottom: '10px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                Select Classes:
              </label>
              <div style={{ marginBottom: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {classes.map(cls => (
                  <label key={cls._id} style={{ display: 'block', marginBottom: '6px' }}>
                    <input
                      type="checkbox"
                      checked={assignmentForm.classIds.includes(cls._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignmentForm({ 
                            ...assignmentForm, 
                            classIds: [...assignmentForm.classIds, cls._id] 
                          });
                        } else {
                          setAssignmentForm({ 
                            ...assignmentForm, 
                            classIds: assignmentForm.classIds.filter(id => id !== cls._id) 
                          });
                        }
                      }}
                    />
                    {' '}{cls.name}
                  </label>
                ))}
              </div>
              <button onClick={handleAddAssignment} style={buttonStyle}>
                <FaCheckCircle /> Create Assignment
              </button>
            </div>
          )}

          <div>
            {teachingAssignments.map(assign => (
              <div key={assign._id} style={cardStyle}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0' }}>
                    {assign.teacherId?.name} → {assign.subjectId?.name}
                  </h3>
                  <p style={{ margin: '6px 0', fontSize: '14px' }}>
                    Classes: {assign.classIds?.map((c, i) => (
                      <span key={c._id}>{c.name}{i < assign.classIds.length - 1 ? ', ' : ''}</span>
                    ))}
                  </p>
                </div>
              </div>
            ))}
            {teachingAssignments.length === 0 && <p>No teaching assignments yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicStructure;
