// src/components/ContactWidgetAuthed.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { emailApi, type UserRoleCode } from '@/api/email';
import { usersApi } from '@/api/users';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/users';

import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Button,
  Alert,
  Fade,
  Chip,
} from '@mui/material';
import { ContactSupport, Person, Mail, Shield } from '@mui/icons-material';

// ———————————————————————————————————————
// Styles communs (repris de ton autre composant)
// ———————————————————————————————————————
const commonStyles = {
  fontFamily: 'Share Tech, monospace',
  borderRadius: '12px',
  techFont: { fontFamily: 'Share Tech, monospace' },
  techFontBold: { fontFamily: 'Share Tech, monospace', fontWeight: 'bold' },
  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '24px',
  },
  headerGlass: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  gradientText: {
    background: 'linear-gradient(45deg, #981A0E, #C41E3A)',
    backgroundClip: 'text' as const,
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
  },
  backgroundGradient: 'linear-gradient(135deg, #e3f8fe 0%, #f0f9ff 100%)',
  buttonBase: {
    fontFamily: 'Share Tech, monospace',
    borderRadius: '12px',
    px: 3,
    py: 1.5,
    textTransform: 'none' as const,
  },
};

// ———————————————————————————————————————
// Sujet par rôle
// ———————————————————————————————————————
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
// Helpers rôle (identiques fonctionnellement)
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
  code: UserRoleCode;
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
  if (s === 'donation_center_admin' || s === 'donation_center' || s === 'center' || s === 'donation-centre-admin')
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
    const hospitalId =
      'hospitalId' in source ? toNumberOrUndefined((source as { hospitalId?: unknown }).hospitalId) : undefined;
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

  // Rôle initial
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

  // Rafraîchit rôle depuis l’API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingRole(true);
        const response = await usersApi.getUserRole({
          userId: userId !== undefined ? String(userId) : undefined,
          email: userEmail || undefined,
        });
        const extracted = extractRoleInfo(response as LooseRole);
        if (!mounted) return;
        setRoleCode(extracted.code);
        setHospitalId(extracted.hospitalId ?? hospitalId);
        setCenterId(extracted.centerId ?? centerId);
      } catch {
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

  // Sujet adapté au rôle
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
    subject === 'Autre' && subjectOther.trim().length > 0 ? `Autre: ${subjectOther.trim()}` : subject;

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

  // Libellé rôle
  const roleLabel =
    roleCode === 'dronist'
      ? 'Dronist'
      : roleCode === 'hospital_admin'
      ? 'Hôpital'
      : roleCode === 'donation_center_admin'
      ? 'Centre de don'
      : roleCode === 'super_admin'
      ? 'Super Admin'
      : 'Utilisateur';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: commonStyles.backgroundGradient,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center', // ← centrage vertical/horizontal
        p: { xs: 2, md: 4 },
      }}
    >
      <Fade in timeout={700}>
        <Paper
          elevation={0}
          sx={{
            ...commonStyles.glassmorphism,
            p: { xs: 3, md: 4 },
            width: '100%',
            maxWidth: 720,
          }}
        >
          {/* Titre */}
          <Paper elevation={0} sx={{ ...commonStyles.headerGlass, p: { xs: 2.5, md: 3 }, mb: 3, textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                mb: 0.5,
                fontFamily: 'Iceland, cursive',
                ...commonStyles.gradientText,
              }}
            >
              Contacter le support IT
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#5C7F9B', ...commonStyles.techFont, opacity: 0.9 }}>
              Nous répondons au plus vite à vos demandes
            </Typography>
          </Paper>

          {/* Bandeau infos utilisateur */}
          <Paper
            elevation={0}
            sx={{
              ...commonStyles.headerGlass,
              p: 2,
              mb: 3,
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Person sx={{ color: '#008EFF' }} />
                <Typography sx={commonStyles.techFontBold}>Nom :</Typography>
                <Typography sx={commonStyles.techFont}>{userName || '—'}</Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Mail sx={{ color: '#008EFF' }} />
                <Typography sx={commonStyles.techFontBold}>Email :</Typography>
                <Typography sx={commonStyles.techFont}>{userEmail || '—'}</Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Shield sx={{ color: '#008EFF' }} />
                <Typography sx={commonStyles.techFontBold}>Rôle :</Typography>
                <Chip
                  label={loadingRole ? 'Chargement…' : roleLabel}
                  size="small"
                  sx={{ ...commonStyles.techFont, backgroundColor: '#f0f4f8' }}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Formulaire */}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <FormControl fullWidth disabled={loadingRole}>
                <InputLabel sx={commonStyles.techFont}>Sujet</InputLabel>
                <Select
                  label="Sujet"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  sx={{ borderRadius: commonStyles.borderRadius, ...commonStyles.techFont }}
                >
                  {subjects.map((s) => (
                    <MenuItem key={s} value={s} sx={commonStyles.techFont}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {subject === 'Autre' && (
                <TextField
                  label="Précisez le sujet"
                  placeholder="Votre sujet"
                  value={subjectOther}
                  onChange={(e) => setSubjectOther(e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-root': { borderRadius: commonStyles.borderRadius },
                    '& .MuiInputBase-input': commonStyles.techFont,
                  }}
                />
              )}

              <TextField
                label="Message"
                placeholder="Décrivez votre problème ou question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullWidth
                multiline
                minRows={6}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: commonStyles.borderRadius },
                  '& .MuiInputBase-input': commonStyles.techFont,
                }}
              />

              <Button
                type="submit"
                disabled={!canSubmit}
                startIcon={<ContactSupport />}
                variant="contained"
                sx={{
                  ...commonStyles.buttonBase,
                  background: canSubmit ? 'linear-gradient(45deg, #008EFF, #0066cc)' : '#93c5fd',
                  color: 'white',
                  '&:hover': {
                    background: canSubmit ? 'linear-gradient(45deg, #0066cc, #0052a3)' : '#93c5fd',
                  },
                }}
              >
                {sending ? 'Envoi…' : 'Envoyer le message'}
              </Button>

              {!!status && (
                <Alert
                  severity={status.includes('succès') ? 'success' : status.includes('Envoi') ? 'info' : 'error'}
                  sx={{ borderRadius: '16px', '& .MuiAlert-message': commonStyles.techFont }}
                >
                  {status}
                </Alert>
              )}
            </Stack>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default ContactWidgetAuthed;
