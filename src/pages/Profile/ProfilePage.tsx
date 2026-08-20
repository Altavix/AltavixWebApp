import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { UserService, type UserProfileDto } from '../../services/UserService';
import { useFetching } from '../../hooks/useFetching';
import Loader from '../../components/UI/Loader';
import '../../styles/pages/Profile/ProfilePage.css';

const ProfilePage: React.FC = () => {
    const { user, logout, isLoading: isAuthLoading } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<UserProfileDto>({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        phoneNumber: ''
    });

    const [fetchProfile, isLoading, error] = useFetching(async (id: string) => {
        const response = await UserService.getUserProfile(id);
        if (response.data) {
            setProfile({
                firstName: response.data.firstName || '',
                lastName: response.data.lastName || '',
                middleName: response.data.middleName || '',
                email: response.data.email || '',
                phoneNumber: response.data.phoneNumber || ''
            });
        }
    });

    const [saveProfile, isSaving, saveError] = useFetching(async (data: UserProfileDto) => {
        return await UserService.updateUserProfile(data);
    });

    useEffect(() => {
        if (isAuthLoading) return;
        
        if (!user) {
            navigate('/login');
            return;
        }
        fetchProfile(user.id);
    }, [user, isAuthLoading, navigate]);

    if (isAuthLoading) return <div style={{ textAlign: 'center', padding: '2rem' }}><Loader /></div>;
    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveProfile(profile);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <h1>Мій профіль</h1>
                
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : '👤'}
                        </div>
                        <div className="profile-info">
                            <h2>{profile.firstName || 'Користувач'} {profile.lastName}</h2>
                            <p className="text-muted">{user.role || 'Клієнт'}</p>
                        </div>
                    </div>
                    
                    <div className="profile-content">
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <Loader />
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
                            {error}
                        </div>
                    ) : (
                        <form className="profile-details" onSubmit={handleSave}>
                            <div className="form-group-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Прізвище</label>
                                    <input 
                                        type="text" 
                                        name="lastName"
                                        value={profile.lastName} 
                                        onChange={handleChange} 
                                        className="form-control"
                                        placeholder="Ваше прізвище"
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Ім'я</label>
                                    <input 
                                        type="text" 
                                        name="firstName"
                                        value={profile.firstName} 
                                        onChange={handleChange} 
                                        className="form-control"
                                        placeholder="Ваше ім'я"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>По-батькові</label>
                                <input 
                                    type="text" 
                                    name="middleName"
                                    value={profile.middleName} 
                                    onChange={handleChange} 
                                    className="form-control"
                                    placeholder="Ваше по-батькові"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={profile.email} 
                                    onChange={handleChange} 
                                    className="form-control"
                                    placeholder="Ваш email"
                                />
                            </div>
                            <div className="form-group">
                                <label>Номер телефону</label>
                                <input 
                                    type="tel" 
                                    name="phoneNumber"
                                    value={profile.phoneNumber} 
                                    onChange={handleChange} 
                                    className="form-control"
                                    placeholder="+380..."
                                />
                            </div>
                            
                            {saveError && <div style={{ color: 'red', marginTop: '1rem' }}>{saveError}</div>}

                            <div className="profile-actions-inline">
                                <button type="submit" className="btn-primary" disabled={isSaving}>
                                    {isSaving ? 'Збереження...' : 'Зберегти зміни'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="profile-actions" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                        <button className="btn-danger" onClick={handleLogout}>
                            Вийти з акаунта
                        </button>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
