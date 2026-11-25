export default {
  fetch() {
    // Public MoneyGuide uses preset lessons. The trusted Node host supports typed questions.
    return Response.json({llm: false}, {headers: {'Cache-Control': 'public, max-age=300, s-maxage=3600'}});
  }
};
