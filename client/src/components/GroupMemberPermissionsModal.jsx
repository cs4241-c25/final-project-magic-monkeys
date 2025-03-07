import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from './Modal';
import "../styles/GroupMemberPermissionsModal.css";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const GroupMemberPermissionsModal = ({ isOpen, onClose, groupId }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchGroupMembers = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/groups/${groupId}/members`);
                setMembers(response.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to load members.");
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchGroupMembers();
        }
    }, [groupId, isOpen]);

    const updateMemberRole = async (userId, newRole) => {
        try {
            await axios.put(`${API_URL}/api/user-groups/${userId}/${groupId}`, { role: newRole });
            setMembers((prev) =>
                prev.map((member) =>
                    member.userId === userId ? { ...member, role: newRole } : member
                )
            );
        } catch (err) {
            console.error("Error updating role:", err);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="permissions-content">
                <h2 className="modal-title">Manage Group Permissions</h2>
                {loading ? (
                    <p>Loading members...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <div className="table-container">
                        <table className="permissions-table">
                            <thead>
                                <tr>
                                    <th className="table-line">Username</th>
                                    <th className="table-line">Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.userId}>
                                        <td className="table-line">{member.username}</td>
                                        <td className="table-line">{member.role}</td>
                                        {member.role !== "owner" ? (
                                            <td>
                                                <select
                                                    className="role-select"
                                                    value={member.role || "member"}
                                                    onChange={(e) => updateMemberRole(member.userId, e.target.value)}
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="member">Member</option>
                                                </select>
                                            </td>
                                        ) : (
                                            <td className="disabled-cell">Cannot modify</td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Modal>
    );
};