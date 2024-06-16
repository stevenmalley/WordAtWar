export const serverPath = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')?
  "http://localhost/WordAtWar" :
  "http://j7441on13.wordatwar.com";
export default serverPath;