require('dotenv').config();
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });


// Define Theme and Set models
const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
  },
}, {
  createdAt: false,
  updatedAt: false,
});

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
  },
  year: {
    type: Sequelize.INTEGER,
  },
  num_parts: {
    type: Sequelize.INTEGER,
  },
  theme_id: {
    type: Sequelize.INTEGER,
  },
  img_url: {
    type: Sequelize.STRING,
  },
}, {
  createdAt: false,
  updatedAt: false,
});

// Set the association between Set and Theme
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function initialize(themeData, setData) {
    return sequelize.sync()
        .then(async () => {
            console.log('Database synchronized successfully.');
    
            try {
                await Theme.bulkCreate(themeData);
                await Set.bulkCreate(setData);
                console.log('Data inserted successfully.');
            } catch (err) {
                console.error('Error inserting data:', err);
                throw err;
            }
        })
        .catch((err) => {
            console.error('Error synchronizing database:', err);
            throw err;
        });
}

// function initialize() {
//   return sequelize.sync()
//     .then(() => {
//       console.log('Database & tables created!');
//     })
//     .catch((err) => {
//       console.error('Error creating database & tables:', err);
//       throw err;
//     });
// }

function getAllSets() {
  return Set.findAll({
      include: [Theme],
      raw: true,
      nest: true,
  })
      .then((sets) => {
          return sets;
      })
      .catch((error) => {
          throw error;
      });
}

function getSetByNum(setNum) {
  return Set.findOne({
      where: { set_num: setNum },
      include: [Theme],
      raw: true,
      nest: true,
  })
  .then((foundSet) => {
      if (foundSet) {
          return foundSet;
      } else {
          throw new Error("Unable to find requested set.");
      }
  })
  .catch((error) => {
      console.error('Error getting set by number:', error);
      throw error;
  });
}

function getSetsByTheme(theme) {
    return Theme.findAll({
        where: {
            name: {
                [Sequelize.Op.iLike]: `%${theme}%`
            }
        }
    })
    .then((themes) => {
        const themeIds = themes.map(theme => theme.id);

        if (themeIds.length === 0) {
            throw new Error("No themes found for the given query.");
        }

        return Set.findAll({
            where: {
                theme_id: {
                    [Sequelize.Op.in]: themeIds
                }
            },
            include: [Theme],
            raw: true,
            nest: true,
        });
    })
    .then((sets) => {
        if (sets.length > 0) {
            return sets;
        } else {
            throw new Error("Unable to find requested sets");
        }
    })
}

function addSet(setData) {
  return new Promise((resolve, reject) => {
    Set.create(setData)
      .then(() => {
        resolve(); // Resolve the promise when the set is successfully created
      })
      .catch((err) => {
        reject(err.errors[0].message); // Reject the promise with the error message
      });
  });
}

function getAllThemes() {
  return Theme.findAll();
}

function editSet(set_num, setData){
  return new Promise((resolve, reject) => {
    Set.update(setData, { where: { set_num } })
      .then((result) => {
        if (result[0] === 0) {
          reject({ message: "Can not find the set" });
        } else {
          resolve();
        }
      })
      .catch((err) => {
        reject({ message: err.errors[0].message });
      });
  });
};

function deleteSet(set_num){
  return new Promise((resolve, reject) => {
    Set.destroy({
      where: {
        set_num: set_num
      }
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
};

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet };
