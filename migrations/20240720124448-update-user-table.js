"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "username", {
      type: Sequelize.STRING,
      allowNull: true, // Making username optional
      unique: true,
    });
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: true, // Making password optional
    });

    await queryInterface.addColumn("Users", "firstname", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Users", "lastname", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Users", "type", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "username", {
      type: Sequelize.STRING,
      allowNull: false, // Reverting username to be mandatory
      unique: true,
    });
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: false, // Reverting password to be mandatory
    });

    // Remove new columns
    await queryInterface.removeColumn("Users", "firstname");
    await queryInterface.removeColumn("Users", "lastname");
    await queryInterface.removeColumn("Users", "type");
  },
};
