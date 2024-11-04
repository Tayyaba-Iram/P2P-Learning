import mongoose from 'mongoose';

const UniAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sapid: { type: String, required: true },
  email: { type: String, required: true },
  cnic: { type: String, required: true },
  university: { type: String, required: true },
  campus: { type: String, required: true },
});

const UniAdminModel = mongoose.model('UniAdmin', UniAdminSchema);

const UniAdminsData = [
    {
      name: 'Mirza Ghalab',
      sapid: '10001',
      email: '10001@admin.riphah.edu.pk',
      cnic: '12121-1212121-1',
      university: 'Riphah',
      campus: 'Gulberg Greens',
    },
    {
      name: 'Nasir Ali',
      sapid: '10002',
      email: '10002@admin.riphah.edu.pk',
      cnic: '13131-1313131-1',
      university: 'Riphah',
      campus: 'I-14',
    },
  ];
  
  // Insert initial UniAdmins data
 export const seedUniAdmins = async () => {
  try {
    await UniAdminModel.insertMany(UniAdminsData);
    console.log('UniAdmins saved successfully');
  } catch (err) {
    console.error('Error saving UniAdmins:', err);
  }
};
export default UniAdminModel;
