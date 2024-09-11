module.exports = {
  inputs: {
    values: {
      type: 'json',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const userProject = await UserProject.create({ ...values }).fetch();

    return {
      userProject,
    };
  },
};