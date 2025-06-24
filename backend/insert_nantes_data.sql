-- Insertion des hôpitaux de Nantes (avec IDs manuels)
INSERT INTO hospital (hospital_id, hospital_name, hospital_city, hospital_postal, hospital_adress, hospital_latitude, hospital_longtitude) VALUES
(1, 'Hôtel-Dieu – CHU de Nantes', 'Nantes', 44093, '1 Place Alexis-Ricordeau', 47.2125008, -1.5527568),
(2, 'Hôpital Saint-Jacques – CHU', 'Nantes', 44093, '85 Rue Saint-Jacques', 47.1960365, -1.5371938),
(3, 'Hôpital Femme-Enfant-Adolescent', 'Nantes', 44093, '38 Boulevard Jean Monnet', 47.2092014, -1.5527301),
(4, 'Hôpital Bellier', 'Nantes', 44300, '37 Rue des Bellangerais', 47.22368240356445, -1.5240068435668945),
(5, 'Hôpital Tourville', 'Nantes', 44000, '26 Rue Tourville', 47.210201263427734, -1.557722806930542),
(6, 'Maison Pirmil (site hospitalier)', 'Nantes', 44200, '9 Rue des Réservoirs', 47.1960364, -1.5371938);

-- Insertion du centre de donation de sang de Nantes (avec ID manuel)
INSERT INTO donationcenter (center_id, center_city, center_postal, center_adress, center_latitude, center_longitude) VALUES
(1, 'Nantes', 44011, '34 Boulevard Jean Monnet', 47.2098952, -1.5513221);

-- Vérification des données insérées
SELECT 'HÔPITAUX' as type, hospital_id as id, hospital_name as name, hospital_city as city, hospital_adress as address, hospital_postal as postal, hospital_latitude as lat, hospital_longtitude as lng 
FROM hospital 
WHERE hospital_city = 'Nantes'
UNION ALL
SELECT 'CENTRE DE DON' as type, center_id as id, 'Maison du Don – EFS' as name, center_city as city, center_adress as address, center_postal as postal, center_latitude as lat, center_longitude as lng 
FROM donationcenter 
WHERE center_city = 'Nantes'
ORDER BY type, id;