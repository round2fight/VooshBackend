"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Tasks", "dueDate", {
      type: Sequelize.DATE,
      allowNull: true, // Change to false if you want to make it mandatory
    });

    await queryInterface.addColumn("Tasks", "status", {
      type: Sequelize.INTEGER,
      allowNull: false, // Change to false if you want to make it mandatory
    });

    await queryInterface.addColumn("Tasks", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: false, // Set to true if you want to allow null values
      references: {
        model: "Users", // Name of the table in your database
        key: "id", // Column in the Users table
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addColumn("Tasks", "uuid", {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Tasks", "dueDate");
    await queryInterface.removeColumn("Tasks", "user_id");
    await queryInterface.removeColumn("Tasks", "uuid");
  },
};
