-- Reinit la séquence users_user_id_seq au max actuel + 1
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users) + 1, false);

-- Verif
SELECT currval('users_user_id_seq');