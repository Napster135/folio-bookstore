const isUserAdmin = (user) => user?.role === 'admin';
const isUserPremium = (user) => user?.role === 'premium';

export { isUserAdmin, isUserPremium };
