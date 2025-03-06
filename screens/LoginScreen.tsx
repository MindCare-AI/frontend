const styles = StyleSheet.create({
  container: Platform.select({
    web: {
      // Use boxShadow for web
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    default: {
      // Use shadow props for native
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }
  }),
  // ...other styles
});