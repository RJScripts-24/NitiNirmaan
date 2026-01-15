-- Clear existing data if any (optional, be careful)
truncate table public.master_districts cascade;
truncate table public.master_states cascade;

-- Insert States & UTs
insert into public.master_states (id, name) values
('AP', 'Andhra Pradesh'),
('AR', 'Arunachal Pradesh'),
('AS', 'Assam'),
('BR', 'Bihar'),
('CG', 'Chhattisgarh'),
('GA', 'Goa'),
('GJ', 'Gujarat'),
('HR', 'Haryana'),
('HP', 'Himachal Pradesh'),
('JH', 'Jharkhand'),
('KA', 'Karnataka'),
('KL', 'Kerala'),
('MP', 'Madhya Pradesh'),
('MH', 'Maharashtra'),
('MN', 'Manipur'),
('ML', 'Meghalaya'),
('MZ', 'Mizoram'),
('NL', 'Nagaland'),
('OD', 'Odisha'),
('PB', 'Punjab'),
('RJ', 'Rajasthan'),
('SK', 'Sikkim'),
('TN', 'Tamil Nadu'),
('TS', 'Telangana'),
('TR', 'Tripura'),
('UP', 'Uttar Pradesh'),
('UK', 'Uttarakhand'),
('WB', 'West Bengal'),
('AN', 'Andaman and Nicobar Islands'),
('CH', 'Chandigarh'),
('DN', 'Dadra and Nagar Haveli and Daman and Diu'),
('DL', 'Delhi'),
('JK', 'Jammu and Kashmir'),
('LA', 'Ladakh'),
('LD', 'Lakshadweep'),
('PY', 'Puducherry');

-- Insert Districts
insert into public.master_districts (state_id, name) values
-- Andhra Pradesh
('AP', 'Anantapur'), ('AP', 'Chittoor'), ('AP', 'East Godavari'), ('AP', 'Guntur'), ('AP', 'Krishna'), ('AP', 'Kurnool'), ('AP', 'Prakasam'), ('AP', 'Srikakulam'), ('AP', 'Sri Potti Sriramulu Nellore'), ('AP', 'Visakhapatnam'), ('AP', 'Vizianagaram'), ('AP', 'West Godavari'), ('AP', 'YSR District, Kadapa'),
-- Arunachal Pradesh
('AR', 'Tawang'), ('AR', 'West Kameng'), ('AR', 'East Kameng'), ('AR', 'Papum Pare'), ('AR', 'Kurung Kumey'), ('AR', 'Kra Daadi'), ('AR', 'Lower Subansiri'), ('AR', 'Upper Subansiri'), ('AR', 'West Siang'), ('AR', 'East Siang'), ('AR', 'Siang'), ('AR', 'Upper Siang'), ('AR', 'Lower Siang'), ('AR', 'Lower Dibang Valley'), ('AR', 'Dibang Valley'), ('AR', 'Anjaw'), ('AR', 'Lohit'), ('AR', 'Namsai'), ('AR', 'Changlang'), ('AR', 'Tirap'), ('AR', 'Longding'),
-- Assam
('AS', 'Baksa'), ('AS', 'Barpeta'), ('AS', 'Biswanath'), ('AS', 'Bongaigaon'), ('AS', 'Cachar'), ('AS', 'Charaideo'), ('AS', 'Chirang'), ('AS', 'Darrang'), ('AS', 'Dhemaji'), ('AS', 'Dhubri'), ('AS', 'Dibrugarh'), ('AS', 'Dima Hasao'), ('AS', 'Goalpara'), ('AS', 'Golaghat'), ('AS', 'Hailakandi'), ('AS', 'Hojai'), ('AS', 'Jorhat'), ('AS', 'Kamrup Metropolitan'), ('AS', 'Kamrup'), ('AS', 'Karbi Anglong'), ('AS', 'Karimganj'), ('AS', 'Kokrajhar'), ('AS', 'Lakhimpur'), ('AS', 'Majuli'), ('AS', 'Morigaon'), ('AS', 'Nagaon'), ('AS', 'Nalbari'), ('AS', 'Sivasagar'), ('AS', 'Sonitpur'), ('AS', 'South Salmara-Mankachar'), ('AS', 'Tinsukia'), ('AS', 'Udalguri'), ('AS', 'West Karbi Anglong'),
-- Bihar
('BR', 'Araria'), ('BR', 'Arwal'), ('BR', 'Aurangabad'), ('BR', 'Banka'), ('BR', 'Begusarai'), ('BR', 'Bhagalpur'), ('BR', 'Bhojpur'), ('BR', 'Buxar'), ('BR', 'Darbhanga'), ('BR', 'East Champaran'), ('BR', 'Gaya'), ('BR', 'Gopalganj'), ('BR', 'Jamui'), ('BR', 'Jehanabad'), ('BR', 'Kaimur'), ('BR', 'Katihar'), ('BR', 'Khagaria'), ('BR', 'Kishanganj'), ('BR', 'Lakhisarai'), ('BR', 'Madhepura'), ('BR', 'Madhubani'), ('BR', 'Munger'), ('BR', 'Muzaffarpur'), ('BR', 'Nalanda'), ('BR', 'Nawada'), ('BR', 'Patna'), ('BR', 'Purnia'), ('BR', 'Rohtas'), ('BR', 'Saharsa'), ('BR', 'Samastipur'), ('BR', 'Saran'), ('BR', 'Sheikhpura'), ('BR', 'Sheohar'), ('BR', 'Sitamarhi'), ('BR', 'Siwan'), ('BR', 'Supaul'), ('BR', 'Vaishali'), ('BR', 'West Champaran'),
-- Chhattisgarh
('CG', 'Balod'), ('CG', 'Baloda Bazar'), ('CG', 'Balrampur'), ('CG', 'Bastar'), ('CG', 'Bemetara'), ('CG', 'Bijapur'), ('CG', 'Bilaspur'), ('CG', 'Dantewada'), ('CG', 'Dhamtari'), ('CG', 'Durg'), ('CG', 'Gariaband'), ('CG', 'Janjgir-Champa'), ('CG', 'Jashpur'), ('CG', 'Kabirdham'), ('CG', 'Kanker'), ('CG', 'Kondagaon'), ('CG', 'Korba'), ('CG', 'Koriya'), ('CG', 'Mahasamund'), ('CG', 'Mungeli'), ('CG', 'Narayanpur'), ('CG', 'Raigarh'), ('CG', 'Raipur'), ('CG', 'Rajnandgaon'), ('CG', 'Sukma'), ('CG', 'Surajpur'), ('CG', 'Surguja'),
-- Goa
('GA', 'North Goa'), ('GA', 'South Goa'),
-- Gujarat
('GJ', 'Ahmedabad'), ('GJ', 'Amreli'), ('GJ', 'Anand'), ('GJ', 'Aravalli'), ('GJ', 'Banaskantha'), ('GJ', 'Bharuch'), ('GJ', 'Bhavnagar'), ('GJ', 'Botad'), ('GJ', 'Chhota Udaipur'), ('GJ', 'Dahod'), ('GJ', 'Dang'), ('GJ', 'Devbhoomi Dwarka'), ('GJ', 'Gandhinagar'), ('GJ', 'Gir Somnath'), ('GJ', 'Jamnagar'), ('GJ', 'Junagadh'), ('GJ', 'Kheda'), ('GJ', 'Kutch'), ('GJ', 'Mahisagar'), ('GJ', 'Mehsana'), ('GJ', 'Morbi'), ('GJ', 'Narmada'), ('GJ', 'Navsari'), ('GJ', 'Panchmahal'), ('GJ', 'Patan'), ('GJ', 'Porbandar'), ('GJ', 'Rajkot'), ('GJ', 'Sabarkantha'), ('GJ', 'Surat'), ('GJ', 'Surendranagar'), ('GJ', 'Tapi'), ('GJ', 'Vadodara'), ('GJ', 'Valsad'),
-- Haryana
('HR', 'Ambala'), ('HR', 'Bhiwani'), ('HR', 'Charkhi Dadri'), ('HR', 'Faridabad'), ('HR', 'Fatehabad'), ('HR', 'Gurugram'), ('HR', 'Hisar'), ('HR', 'Jhajjar'), ('HR', 'Jind'), ('HR', 'Kaithal'), ('HR', 'Karnal'), ('HR', 'Kurukshetra'), ('HR', 'Mahendragarh'), ('HR', 'Nuh'), ('HR', 'Palwal'), ('HR', 'Panchkula'), ('HR', 'Panipat'), ('HR', 'Rewari'), ('HR', 'Rohtak'), ('HR', 'Sirsa'), ('HR', 'Sonipat'), ('HR', 'Yamunanagar'),
-- Himachal Pradesh
('HP', 'Bilaspur'), ('HP', 'Chamba'), ('HP', 'Hamirpur'), ('HP', 'Kangra'), ('HP', 'Kinnaur'), ('HP', 'Kullu'), ('HP', 'Lahaul and Spiti'), ('HP', 'Mandi'), ('HP', 'Shimla'), ('HP', 'Sirmaur'), ('HP', 'Solan'), ('HP', 'Una'),
-- Jharkhand
('JH', 'Bokaro'), ('JH', 'Chatra'), ('JH', 'Deoghar'), ('JH', 'Dhanbad'), ('JH', 'Dumka'), ('JH', 'East Singhbhum'), ('JH', 'Garhwa'), ('JH', 'Giridih'), ('JH', 'Godda'), ('JH', 'Gumla'), ('JH', 'Hazaribagh'), ('JH', 'Jamtara'), ('JH', 'Khunti'), ('JH', 'Koderma'), ('JH', 'Latehar'), ('JH', 'Lohardaga'), ('JH', 'Pakur'), ('JH', 'Palamu'), ('JH', 'Ramgarh'), ('JH', 'Ranchi'), ('JH', 'Sahibganj'), ('JH', 'Seraikela Kharsawan'), ('JH', 'Simdega'), ('JH', 'West Singhbhum'),
-- Karnataka
('KA', 'Bagalkot'), ('KA', 'Ballari'), ('KA', 'Belagavi'), ('KA', 'Bengaluru Rural'), ('KA', 'Bengaluru Urban'), ('KA', 'Bidar'), ('KA', 'Chamarajanagar'), ('KA', 'Chikkaballapur'), ('KA', 'Chikkamagaluru'), ('KA', 'Chitradurga'), ('KA', 'Dakshina Kannada'), ('KA', 'Davangere'), ('KA', 'Dharwad'), ('KA', 'Gadag'), ('KA', 'Hassan'), ('KA', 'Haveri'), ('KA', 'Kalaburagi'), ('KA', 'Kodagu'), ('KA', 'Kolar'), ('KA', 'Koppal'), ('KA', 'Mandya'), ('KA', 'Mysuru'), ('KA', 'Raichur'), ('KA', 'Ramanagara'), ('KA', 'Shivamogga'), ('KA', 'Tumakuru'), ('KA', 'Udupi'), ('KA', 'Uttara Kannada'), ('KA', 'Vijayapura'), ('KA', 'Yadgir'),
-- Kerala
('KL', 'Alappuzha'), ('KL', 'Ernakulam'), ('KL', 'Idukki'), ('KL', 'Kannur'), ('KL', 'Kasaragod'), ('KL', 'Kollam'), ('KL', 'Kottayam'), ('KL', 'Kozhikode'), ('KL', 'Malappuram'), ('KL', 'Palakkad'), ('KL', 'Pathanamthitta'), ('KL', 'Thiruvananthapuram'), ('KL', 'Thrissur'), ('KL', 'Wayanad'),
-- Madhya Pradesh
('MP', 'Agar Malwa'), ('MP', 'Alirajpur'), ('MP', 'Anuppur'), ('MP', 'Ashoknagar'), ('MP', 'Balaghat'), ('MP', 'Barwani'), ('MP', 'Betul'), ('MP', 'Bhind'), ('MP', 'Bhopal'), ('MP', 'Burhanpur'), ('MP', 'Chhatarpur'), ('MP', 'Chhindwara'), ('MP', 'Damoh'), ('MP', 'Datia'), ('MP', 'Dewas'), ('MP', 'Dhar'), ('MP', 'Dindori'), ('MP', 'Guna'), ('MP', 'Gwalior'), ('MP', 'Harda'), ('MP', 'Hoshangabad'), ('MP', 'Indore'), ('MP', 'Jabalpur'), ('MP', 'Jhabua'), ('MP', 'Katni'), ('MP', 'Khandwa'), ('MP', 'Khargone'), ('MP', 'Mandla'), ('MP', 'Mandsaur'), ('MP', 'Morena'), ('MP', 'Narsinghpur'), ('MP', 'Neemuch'), ('MP', 'Panna'), ('MP', 'Raisen'), ('MP', 'Rajgarh'), ('MP', 'Ratlam'), ('MP', 'Rewa'), ('MP', 'Sagar'), ('MP', 'Satna'), ('MP', 'Sehore'), ('MP', 'Seoni'), ('MP', 'Shahdol'), ('MP', 'Shajapur'), ('MP', 'Sheopur'), ('MP', 'Shivpuri'), ('MP', 'Sidhi'), ('MP', 'Singrauli'), ('MP', 'Tikamgarh'), ('MP', 'Ujjain'), ('MP', 'Umaria'), ('MP', 'Vidisha'),
-- Maharashtra
('MH', 'Ahmednagar'), ('MH', 'Akola'), ('MH', 'Amravati'), ('MH', 'Aurangabad'), ('MH', 'Beed'), ('MH', 'Bhandara'), ('MH', 'Buldhana'), ('MH', 'Chandrapur'), ('MH', 'Dhule'), ('MH', 'Gadchiroli'), ('MH', 'Gondia'), ('MH', 'Hingoli'), ('MH', 'Jalgaon'), ('MH', 'Jalna'), ('MH', 'Kolhapur'), ('MH', 'Latur'), ('MH', 'Mumbai City'), ('MH', 'Mumbai Suburban'), ('MH', 'Nagpur'), ('MH', 'Nanded'), ('MH', 'Nandurbar'), ('MH', 'Nashik'), ('MH', 'Osmanabad'), ('MH', 'Palghar'), ('MH', 'Parbhani'), ('MH', 'Pune'), ('MH', 'Raigad'), ('MH', 'Ratnagiri'), ('MH', 'Sangli'), ('MH', 'Satara'), ('MH', 'Sindhudurg'), ('MH', 'Solapur'), ('MH', 'Thane'), ('MH', 'Wardha'), ('MH', 'Washim'), ('MH', 'Yavatmal'),
-- Delhi
('DL', 'Central Delhi'), ('DL', 'East Delhi'), ('DL', 'New Delhi'), ('DL', 'North Delhi'), ('DL', 'North East Delhi'), ('DL', 'North West Delhi'), ('DL', 'Shahdara'), ('DL', 'South Delhi'), ('DL', 'South East Delhi'), ('DL', 'South West Delhi'), ('DL', 'West Delhi'),
-- Punjab
('PB', 'Amritsar'), ('PB', 'Barnala'), ('PB', 'Bathinda'), ('PB', 'Faridkot'), ('PB', 'Fatehgarh Sahib'), ('PB', 'Fazilka'), ('PB', 'Ferozepur'), ('PB', 'Gurdaspur'), ('PB', 'Hoshiarpur'), ('PB', 'Jalandhar'), ('PB', 'Kapurthala'), ('PB', 'Ludhiana'), ('PB', 'Mansa'), ('PB', 'Moga'), ('PB', 'Muktsar'), ('PB', 'Nawanshahr'), ('PB', 'Pathankot'), ('PB', 'Patiala'), ('PB', 'Rupnagar'), ('PB', 'Sahibzada Ajit Singh Nagar'), ('PB', 'Sangrur'), ('PB', 'Tarn Taran'),
-- Rajasthan
('RJ', 'Ajmer'), ('RJ', 'Alwar'), ('RJ', 'Banswara'), ('RJ', 'Baran'), ('RJ', 'Barmer'), ('RJ', 'Bharatpur'), ('RJ', 'Bhilwara'), ('RJ', 'Bikaner'), ('RJ', 'Bundi'), ('RJ', 'Chittorgarh'), ('RJ', 'Churu'), ('RJ', 'Dausa'), ('RJ', 'Dholpur'), ('RJ', 'Dungarpur'), ('RJ', 'Hanumangarh'), ('RJ', 'Jaipur'), ('RJ', 'Jaisalmer'), ('RJ', 'Jalore'), ('RJ', 'Jhalawar'), ('RJ', 'Jhunjhunu'), ('RJ', 'Jodhpur'), ('RJ', 'Karauli'), ('RJ', 'Kota'), ('RJ', 'Nagaur'), ('RJ', 'Pali'), ('RJ', 'Pratapgarh'), ('RJ', 'Rajsamand'), ('RJ', 'Sawai Madhopur'), ('RJ', 'Sikar'), ('RJ', 'Sirohi'), ('RJ', 'Sri Ganganagar'), ('RJ', 'Tonk'), ('RJ', 'Udaipur'),
-- Tamil Nadu
('TN', 'Ariyalur'), ('TN', 'Chengalpattu'), ('TN', 'Chennai'), ('TN', 'Coimbatore'), ('TN', 'Cuddalore'), ('TN', 'Dharmapuri'), ('TN', 'Dindigul'), ('TN', 'Erode'), ('TN', 'Kallakurichi'), ('TN', 'Kanchipuram'), ('TN', 'Kanyakumari'), ('TN', 'Karur'), ('TN', 'Krishnagiri'), ('TN', 'Madurai'), ('TN', 'Nagapattinam'), ('TN', 'Namakkal'), ('TN', 'Nilgiris'), ('TN', 'Perambalur'), ('TN', 'Pudukkottai'), ('TN', 'Ramanathapuram'), ('TN', 'Ranipet'), ('TN', 'Salem'), ('TN', 'Sivaganga'), ('TN', 'Tenkasi'), ('TN', 'Thanjavur'), ('TN', 'Theni'), ('TN', 'Thoothukudi'), ('TN', 'Tiruchirappalli'), ('TN', 'Tirunelveli'), ('TN', 'Tirupathur'), ('TN', 'Tiruppur'), ('TN', 'Tiruvallur'), ('TN', 'Tiruvannamalai'), ('TN', 'Tiruvarur'), ('TN', 'Vellore'), ('TN', 'Viluppuram'), ('TN', 'Virudhunagar'),
-- Uttar Pradesh
('UP', 'Agra'), ('UP', 'Aligarh'), ('UP', 'Ambedkar Nagar'), ('UP', 'Amethi'), ('UP', 'Amroha'), ('UP', 'Auraiya'), ('UP', 'Ayodhya'), ('UP', 'Azamgarh'), ('UP', 'Baghpat'), ('UP', 'Bahraich'), ('UP', 'Ballia'), ('UP', 'Balrampur'), ('UP', 'Banda'), ('UP', 'Barabanki'), ('UP', 'Bareilly'), ('UP', 'Basti'), ('UP', 'Bhadohi'), ('UP', 'Bijnor'), ('UP', 'Budaun'), ('UP', 'Bulandshahr'), ('UP', 'Chandauli'), ('UP', 'Chitrakoot'), ('UP', 'Deoria'), ('UP', 'Etah'), ('UP', 'Etawah'), ('UP', 'Farrukhabad'), ('UP', 'Fatehpur'), ('UP', 'Firozabad'), ('UP', 'Gautam Buddha Nagar'), ('UP', 'Ghaziabad'), ('UP', 'Ghazipur'), ('UP', 'Gonda'), ('UP', 'Gorakhpur'), ('UP', 'Hamirpur'), ('UP', 'Hapur'), ('UP', 'Hardoi'), ('UP', 'Hathras'), ('UP', 'Jalaun'), ('UP', 'Jaunpur'), ('UP', 'Jhansi'), ('UP', 'Kannauj'), ('UP', 'Kanpur Dehat'), ('UP', 'Kanpur Nagar'), ('UP', 'Kasganj'), ('UP', 'Kaushambi'), ('UP', 'Kheri'), ('UP', 'Kushinagar'), ('UP', 'Lalitpur'), ('UP', 'Lucknow'), ('UP', 'Maharajganj'), ('UP', 'Mahoba'), ('UP', 'Mainpuri'), ('UP', 'Mathura'), ('UP', 'Mau'), ('UP', 'Meerut'), ('UP', 'Mirzapur'), ('UP', 'Moradabad'), ('UP', 'Muzaffarnagar'), ('UP', 'Pilibhit'), ('UP', 'Pratapgarh'), ('UP', 'Prayagraj'), ('UP', 'Raebareli'), ('UP', 'Rampur'), ('UP', 'Saharanpur'), ('UP', 'Sambhal'), ('UP', 'Sant Kabir Nagar'), ('UP', 'Shahjahanpur'), ('UP', 'Shamli'), ('UP', 'Shravasti'), ('UP', 'Siddharthnagar'), ('UP', 'Sitapur'), ('UP', 'Sonbhadra'), ('UP', 'Sultanpur'), ('UP', 'Unnao'), ('UP', 'Varanasi'),
-- West Bengal
('WB', 'Alipurduar'), ('WB', 'Bankura'), ('WB', 'Birbhum'), ('WB', 'Cooch Behar'), ('WB', 'Dakshin Dinajpur'), ('WB', 'Darjeeling'), ('WB', 'Hooghly'), ('WB', 'Howrah'), ('WB', 'Jalpaiguri'), ('WB', 'Jhargram'), ('WB', 'Kalimpong'), ('WB', 'Kolkata'), ('WB', 'Malda'), ('WB', 'Murshidabad'), ('WB', 'Nadia'), ('WB', 'North 24 Parganas'), ('WB', 'Paschim Bardhaman'), ('WB', 'Paschim Medinipur'), ('WB', 'Purba Bardhaman'), ('WB', 'Purba Medinipur'), ('WB', 'Purulia'), ('WB', 'South 24 Parganas'), ('WB', 'Uttar Dinajpur');
