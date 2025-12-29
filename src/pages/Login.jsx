import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ChefHat, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { error } = await signIn({ email, password });
            if (error) throw error;
            navigate('/');
        } catch (err) {
            setError('Identifiants incorrects');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg-body)',
            padding: 'var(--spacing-md)'
        }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {/* Logo / Brand */}
                <div className="text-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 92, 53, 0.1)',
                        color: 'var(--color-primary)',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        <ChefHat size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', color: 'var(--color-secondary)', marginBottom: 'var(--spacing-xs)' }}>Traiteur L'Agape</h1>
                    <p style={{ color: 'var(--color-text-light)' }}>Connexion sécurisée</p>
                </div>

                {/* Login Card */}
                <div className="card">
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-main)', marginBottom: '4px' }}>Connexion</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Entrez vos identifiants pour continuer</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '0',
                                    bottom: '0',
                                    left: '0',
                                    paddingLeft: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    pointerEvents: 'none',
                                    color: 'var(--color-text-light)'
                                }}>
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError('');
                                    }}
                                    style={{
                                        paddingLeft: '40px',
                                        width: '100%',
                                        borderColor: error ? 'var(--color-danger)' : 'var(--color-border)'
                                    }}
                                    placeholder="Email"
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '0',
                                    bottom: '0',
                                    left: '0',
                                    paddingLeft: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    pointerEvents: 'none',
                                    color: 'var(--color-text-light)'
                                }}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError('');
                                    }}
                                    style={{
                                        paddingLeft: '40px',
                                        width: '100%',
                                        borderColor: error ? 'var(--color-danger)' : 'var(--color-border)'
                                    }}
                                    placeholder="Mot de passe"
                                    required
                                />
                            </div>
                            {error && (
                                <p style={{
                                    marginTop: '8px',
                                    fontSize: '0.875rem',
                                    color: 'var(--color-danger)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    {error}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                            style={{ width: '100%', padding: '12px', gap: '8px', fontSize: '1rem', opacity: isLoading ? 0.7 : 1 }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Connexion...</span>
                                </>
                            ) : (
                                <>
                                    <span>Accéder à l'espace</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center" style={{ marginTop: 'var(--spacing-xl)', fontSize: '0.875rem', color: '#99acc2' }}>
                    © {new Date().getFullYear()} L'Agape. Tous droits réservés.
                </p>
            </div>
        </div>
    );
};

export default Login;
