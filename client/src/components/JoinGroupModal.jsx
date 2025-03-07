import React, { useState } from 'react';
import { Modal } from './Modal';
import { BiPlus, BiUserPlus } from 'react-icons/bi';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from './Toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const JoinGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
    const [mode, setMode] = useState('select');
    const [groupName, setGroupName] = useState('');
    const [groupCode, setGroupCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [groupToJoin, setGroupToJoin] = useState(null);
    const { dbUser } = useUser();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: groupName, userId: dbUser._id }),
            });

            if (!response.ok) {
                throw new Error('Failed to create group');
            }
            const groupData = await response.json();
            addToast('Group created successfully!', 'success');

            onGroupCreated({
                ...groupData
            });
            resetForm();
            onClose();
            setTimeout(() => {
                navigate(`/group/${groupData._id}`);
            }, 500);
        } catch (err) {
            setError('Failed to create group. Please try again.');
            console.error('Group creation error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckGroup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Fetch group details first
            const groupResponse = await fetch(`${API_URL}/api/groups/invite/${groupCode}`);
            if (!groupResponse.ok) {
                setError('Group not found. Please check the code and try again.');
                throw new Error('Group not found. Please check the code and try again.');
            }

            const groupData = await groupResponse.json();

            const joinResponse = await fetch(`${API_URL}/api/user-groups/check/${dbUser._id}/${groupData._id}`);
            const joinData = await joinResponse.json();

            if(joinData.isMember){
                setError('You are already a member of this group.');
                throw new Error('You are already a member of this group.');
            }

            // // Get member count (you'll need to implement this endpoint)
            // const membersResponse = await fetch(`${API_URL}/api/groups/${groupCode}/members`);
            // if (!membersResponse.ok) {
            //     throw new Error('Failed to fetch member details');
            // }

            // const membersData = await membersResponse.json();

            setGroupToJoin({
                ...groupData
            });
            setMode('confirm');
        } catch (err) {
            console.error('Group check error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinConfirmed = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/user-groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: dbUser._id,
                    groupId: groupToJoin._id,
                    role: 'member'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to join group');
            }

            const memberData = await response.json();
            addToast('Successfully joined group!', 'success');
            onGroupCreated({
                ...groupToJoin,
                membership: memberData
            });
            resetForm();
            onClose();
            navigate(`/group/${groupToJoin._id}`);
        } catch (err) {
            setError('Failed to join group. Please try again.');
            console.error('Group join error:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setMode('select');
        setGroupName('');
        setGroupCode('');
        setError('');
        setGroupToJoin(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="py-8 px-6">
                {mode === 'select' && (
                    <div>
                        <h2 className="text-2xl font-bold text-white text-center mb-8">
                            Join or Create a Group
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setMode('create')}
                                className="flex flex-col items-center justify-center p-6 bg-[#373737] bg-opacity-10 rounded-lg hover:bg-[#444444] transition-all"
                            >
                                <BiPlus className="text-4xl text-[#ff5c5c] mb-2" />
                                <span className="text-white font-semibold">Create Group</span>
                            </button>
                            <button
                                onClick={() => setMode('join')}
                                className="flex flex-col items-center justify-center p-6 bg-[#373737] bg-opacity-10 rounded-lg hover:bg-[#444444] transition-all"
                            >
                                <BiUserPlus className="text-4xl text-[#ff5c5c] mb-2" />
                                <span className="text-white font-semibold">Join Group</span>
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'create' && (
                    <form onSubmit={handleCreateGroup}>
                        <h2 className="text-2xl font-bold text-white text-center mb-8">
                            Create a New Group
                        </h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Group Name"
                                className="w-full p-3 bg-[#373737] rounded-lg border border-[#444444] text-white placeholder-gray-400 focus:outline-none focus:border-[#ff5c5c]"
                                required
                            />
                            {error && (
                                <p className="text-[#ff5c5c] text-sm mt-2">{error}</p>
                            )}
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setMode('select')}
                                    className="px-4 py-2 text-white bg-[#373737] hover:bg-[#444444] rounded-lg transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-[#ff5c5c] text-white rounded-lg hover:bg-[#ff716d] transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Group'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {mode === 'join' && (
                    <form onSubmit={handleCheckGroup}>
                        <h2 className="text-2xl font-bold text-white text-center mb-8">
                            Join a Group
                        </h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={groupCode}
                                onChange={(e) => setGroupCode(e.target.value)}
                                placeholder="Enter Group Code"
                                className="w-full p-3 bg-[#373737] rounded-lg border border-[#444444] text-white placeholder-gray-400 focus:outline-none focus:border-[#ff5c5c]"
                                required
                            />
                            {error && (
                                <p className="text-[#ff5c5c]  text-sm mt-2">{error}</p>
                            )}
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setMode('select')}
                                    className="px-4 py-2 text-white bg-[#373737] hover:bg-[#444444] rounded-lg transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-[#ff5c5c] text-white rounded-lg hover:bg-[#ff716d] transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Checking...' : 'Continue'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {mode === 'confirm' && groupToJoin && (
                    <div className="modal-form">
                        <h2 className="modal-title">Confirm Join Group</h2>
                        <div className="group-preview">
                            <h3 className="group-preview-name">{groupToJoin.name}</h3>
                            {/* <p className="group-preview-members">
                                {groupToJoin.memberCount} member{groupToJoin.memberCount !== 1 ? 's' : ''}
                            </p> */}
                            {/* Add more group details here if needed */}
                        </div>
                        {error && <p className="text-[#ff5c5c] text-sm mt-2">{error}</p>}
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => setMode('join')}
                                className="px-4 py-2 text-white bg-[#373737] hover:bg-[#444444] rounded-lg transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleJoinConfirmed}
                                disabled={loading}
                                className="px-4 py-2 bg-[#ff5c5c] text-white rounded-lg hover:bg-[#ff716d] transition-colors disabled:opacity-50"
                            >

                                {loading ? 'Joining...' : 'Join Group'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};