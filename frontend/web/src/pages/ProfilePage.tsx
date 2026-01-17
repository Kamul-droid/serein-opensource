import { useEffect, useState } from 'react';
import { api } from '../utils/api';

type Profile = {
  name?: string;
  bio?: string;
  beliefs?: string[];
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({});
  const [beliefs, setBeliefs] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await api.getProfile();
      setProfile(data);
      setBio(data.bio || '');
      const beliefData = await api.getBeliefs();
      setBeliefs((beliefData.beliefs || []).join(', '));
    };
    load().catch(() => null);
  }, []);

  const handleSave = async () => {
    setStatus(null);
    const beliefList = beliefs
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    await api.updateProfile({ name: profile.name, bio });
    await api.updateBeliefs({ beliefs: beliefList });
    setStatus('Profile updated');
  };

  return (
    <div className="stack">
      <div className="card stack">
        <h2>Your profile</h2>
        <div className="grid grid--2">
          <label className="stack" style={{ gap: 8 }}>
            <span>Name</span>
            <input
              className="input"
              value={profile.name || ''}
              onChange={(event) => setProfile({ ...profile, name: event.target.value })}
              placeholder="Your name"
            />
          </label>
          <label className="stack" style={{ gap: 8 }}>
            <span>Bio</span>
            <input
              className="input"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="A short description"
            />
          </label>
        </div>
        <label className="stack" style={{ gap: 8 }}>
          <span>Beliefs & focus areas</span>
          <input
            className="input"
            value={beliefs}
            onChange={(event) => setBeliefs(event.target.value)}
            placeholder="Mindfulness, gratitude..."
          />
        </label>
        <button className="button" onClick={handleSave}>
          Save profile
        </button>
        {status && <span className="badge">{status}</span>}
      </div>
    </div>
  );
}
