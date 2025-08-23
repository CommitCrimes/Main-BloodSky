// src/components/ContactWidgetAuthed.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { emailApi, type UserRoleCode } from '@/api/email';
import { usersApi } from '@/api/users';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/users';

type RoleGroup = 'dronist' | 'hospital' | 'donation_center' | 'user';

const SUBJECTS: Record<RoleGroup, string[]> = {
  dronist: [
    'Problème drone / matériel',
    'Plan de mission (upload/édition)',
    'Zone de vol / géofencing',
    'Compte / Accès',
    'Bugs dashboard / app',
    'Autre',
  ],
  hospital: [
    'Problème de livraison',
    'Suivi de commande',
    'Incident de réception',
    'Compte / Accès',
    'Bugs dashboard / app',
    'Facturation',
    'Autre',
  ],
  donation_center: [
    'Planification des collectes',
    'Stock & expédition',
    'Incident de collecte',
    'Compte / Accès',
    'Bugs dashboard / app',
    'Facturation',
    'Autre',
  ],
  user: ['Assistance générale', 'Compte / Accès', 'Question produit', 'Autre'],
};

// ———————————————————————————————————————
// Types & helpers de normalisation du rôle
// ———————————————————————————————————————
type LooseRole =
  | string
  | {
      type?: unknown;
      role?: unknown;
      hospitalId?: unknown;
      centerId?: unknown;
    }
  | null
  | undefined;

interface ExtractedRole {
  code: UserRoleCode;         // 'dronist' | 'hospital_admin' | 'donation_center_admin' | 'super_admin' | 'user'
  hospitalId?: number;
  centerId?: number;
}

function normalizeRoleCode(input: unknown): UserRoleCode {
  const raw =
    typeof input === 'string'
      ? input
      : typeof input === 'object' && input && 'type' in input && typeof (input as { type?: unknown }).type === 'string'
      ? (input as { type: string }).type
      : typeof input === 'object' && input && 'role' in input && typeof (input as { role?: unknown }).role === 'string'
      ? (input as { role: string }).role
      : 'user';

  const s = String(raw).trim().toLowerCase();

  if (s === 'dronist' || s === 'pilot') return 'dronist';
  if (s === 'hospital_admin' || s === 'hospital' || s === 'hospital-admin') return 'hospital_admin';
  if (
    s === 'donation_center_admin' ||
    s === 'donation_center' ||
    s === 'center' ||
    s === 'donation-centre-admin'
  )
    return 'donation_center_admin';
  if (s === 'super_admin' || s === 'superadmin' || s === 'admin') return 'super_admin';
  return 'user';
}

function toNumberOrUndefined(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
  return undefined;
}

function extractRoleInfo(source: LooseRole): ExtractedRole {
  if (source && typeof source === 'object') {
    const code = normalizeRoleCode(source);
    const hospitalId = 'hospitalId' in source ? toNumberOrUndefined((source as { hospitalId?: unknown }).hospitalId) : undefined;
    const centerId =
      'centerId' in source ? toNumberOrUndefined((source as { centerId?: unknown }).centerId) : undefined;
    return { code, hospitalId, centerId };
  }
  return { code: normalizeRoleCode(source) };
}

function toRoleGroup(code: UserRoleCode): RoleGroup {
  if (code === 'dronist') return 'dronist';
  if (code === 'hospital_admin') return 'hospital';
  if (code === 'donation_center_admin') return 'donation_center';
  return 'user';
}

// Type guards optionnels si tu conserves le type UserRole fort côté front :
function pickFromUserRole(role: UserRole | null): ExtractedRole {
  if (!role) return { code: 'user' };
  const code = normalizeRoleCode(role.type);
  const hospitalId = toNumberOrUndefined((role as unknown as { hospitalId?: unknown }).hospitalId);
  const centerId = toNumberOrUndefined((role as unknown as { centerId?: unknown }).centerId);
  return { code, hospitalId, centerId };
}

// ———————————————————————————————————————

const ContactWidgetAuthed: React.FC = () => {
  const { user } = useAuth();

  // 1) Point de départ : rôle issu du token (auth) si présent
  const initialFromAuth: ExtractedRole = useMemo(() => {
    const fromAuth = user?.role ? pickFromUserRole(user.role as UserRole) : { code: 'user' as UserRoleCode };
    return fromAuth;
  }, [user?.role]);

  const [roleCode, setRoleCode] = useState<UserRoleCode>(initialFromAuth.code);
  const [hospitalId, setHospitalId] = useState<number | undefined>(initialFromAuth.hospitalId);
  const [centerId, setCenterId] = useState<number | undefined>(initialFromAuth.centerId);
  const [loadingRole, setLoadingRole] = useState<boolean>(true);

  const [message, setMessage] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [subjectOther, setSubjectOther] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  // Infos utilisateur
  const userEmail: string = user?.email ?? '';
  const userName: string = `${user?.userFirstname ?? ''} ${user?.userName ?? ''}`.trim();
  const userId: number | undefined = toNumberOrUndefined(user?.userId);

  // 2) On tente de rafraîchir depuis l’API (si disponible)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingRole(true);
        const response = await usersApi.getUserRole({
          userId: userId !== undefined ? String(userId) : undefined,
          email: userEmail || undefined,
        });

        // Le backend peut renvoyer une string, un objet { type }, ou un wrapper { role: '...' }
        const extracted = extractRoleInfo(response as LooseRole);
        if (!mounted) return;

        setRoleCode(extracted.code);
        setHospitalId(extracted.hospitalId ?? hospitalId);
        setCenterId(extracted.centerId ?? centerId);
      } catch {
        // En cas d’échec, on reste sur ce qu’on a déjà (auth)
        if (!mounted) return;
        setRoleCode((prev) => prev ?? initialFromAuth.code);
        setHospitalId((prev) => prev ?? initialFromAuth.hospitalId);
        setCenterId((prev) => prev ?? initialFromAuth.centerId);
      } finally {
        if (mounted) setLoadingRole(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, userId]);

  // Sujet adapté au groupe
  const roleGroup = useMemo(() => toRoleGroup(roleCode), [roleCode]);
  const subjects = useMemo(() => SUBJECTS[roleGroup], [roleGroup]);

  // Sujet par défaut
  useEffect(() => {
    if (subjects.length && !subject) {
      setSubject(subjects[0]);
    } else if (!subjects.includes(subject)) {
      setSubject(subjects[0] ?? '');
    }
  }, [subjects, subject]);

  const resolvedSubject =
    subject === 'Autre' && subjectOther.trim().length > 0
      ? `Autre: ${subjectOther.trim()}`
      : subject;

  const canSubmit =
    userId !== undefined &&
    userEmail.length > 0 &&
    userName.length > 0 &&
    resolvedSubject.length > 0 &&
    message.trim().length > 0 &&
    !sending;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || userId === undefined) return;

    setSending(true);
    setStatus('Envoi en cours…');

    try {
      await emailApi.sendSupportEmail({
        name: userName,
        email: userEmail,
        subject: resolvedSubject,
        message,
        userId,
        userRole: roleCode,
        hospitalId,
        centerId,
        meta: {
          userId,
          name: userName,
          email: userEmail,
          role: roleCode,
          hospitalId,
          centerId,
          locale: navigator.language,
          userAgent: navigator.userAgent,
        },
      });

      setStatus('Message envoyé avec succès !');
      setMessage('');
      setSubject(subjects[0] ?? '');
      setSubjectOther('');
    } catch {
      setStatus("Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '580px',
        margin: '0 auto',
        padding: '30px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
      }}
    >
      <h3
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '25px',
          color: '#1f2937',
          textAlign: 'center',
        }}
      >
        Contacter le support IT
      </h3>

      {/* Bandeau infos utilisateur */}
      <div
        style={{
          marginBottom: '18px',
          padding: '12px 14px',
          background: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          fontSize: 14,
          color: '#374151',
        }}
      >
        <div><strong>Nom :</strong> {userName || '—'}</div>
        <div><strong>Email :</strong> {userEmail || '—'}</div>
        <div>
          <strong>Rôle :</strong>{' '}
          {loadingRole
            ? 'Chargement…'
            : roleCode === 'dronist'
            ? 'Dronist'
            : roleCode === 'hospital_admin'
            ? 'Hôpital'
            : roleCode === 'donation_center_admin'
            ? 'Centre de don'
            : roleCode === 'super_admin'
            ? 'Super Admin'
            : 'Utilisateur'}
          {hospitalId ? '' : ''}
          {centerId ? '' : ''}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Sujet */}
        <div>
          <label
            style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}
            htmlFor="cw-subject"
          >
            Sujet
          </label>
          <select
            id="cw-subject"
            value={subject}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSubject(e.target.value)}
            required
            disabled={loadingRole}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #d1d5db',
              borderRadius: 8,
              fontSize: 16,
              background: loadingRole ? '#f3f4f6' : 'white',
            }}
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Sujet libre si "Autre" */}
        {subject === 'Autre' && (
          <div>
            <label
              style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}
              htmlFor="cw-subject-other"
            >
              Précisez le sujet
            </label>
            <input
              id="cw-subject-other"
              type="text"
              placeholder="Votre sujet"
              value={subjectOther}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubjectOther(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #d1d5db',
                borderRadius: 8,
                fontSize: 16,
              }}
            />
          </div>
        )}

        {/* Message */}
        <div>
          <label
            style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}
            htmlFor="cw-message"
          >
            Message
          </label>
          <textarea
            id="cw-message"
            placeholder="Décrivez votre problème ou question..."
            value={message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
            required
            rows={6}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #d1d5db',
              borderRadius: 8,
              fontSize: 16,
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Submit */}
        <div style={{ marginTop: 6 }}>
          <input
            type="submit"
            value={sending ? 'Envoi…' : 'Envoyer le message'}
            disabled={!canSubmit}
            style={{
              width: '100%',
              backgroundColor: canSubmit ? '#3b82f6' : '#93c5fd',
              color: 'white',
              padding: '14px 24px',
              fontSize: 16,
              fontWeight: 600,
              border: 'none',
              borderRadius: 8,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              if (canSubmit) e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseOut={(e) => {
              if (canSubmit) e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          />
        </div>
      </form>

      {status && (
        <div
          style={{
            marginTop: 20,
            padding: '12px 16px',
            borderRadius: 8,
            backgroundColor: status.includes('succès') ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${status.includes('succès') ? '#22c55e' : '#ef4444'}`,
            color: status.includes('succès') ? '#166534' : '#dc2626',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
};

export default ContactWidgetAuthed;
