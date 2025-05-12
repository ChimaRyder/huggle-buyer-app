import { StyleSheet, Dimensions, ViewStyle, TextStyle, ImageStyle } from 'react-native';

const { width } = Dimensions.get('window');

type ProfileStyles = {
  container: ViewStyle;
  imageWrapper: ViewStyle;
  imageBorder: ViewStyle;
  blurContainer: ViewStyle;
  profileImage: ImageStyle;
  userName: TextStyle;
  tabsWrapper: ViewStyle;
  glassWrapper: ViewStyle;
  glassTab: ViewStyle;
  tabText: TextStyle;
  signOutButton: ViewStyle;
  signOutText: TextStyle;
};

export const profileStyles = StyleSheet.create<ProfileStyles>({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8', //-> changed this
    alignItems: 'center',
  },
  imageWrapper: {
    alignItems: 'center',
    marginTop: 50,
  },
  imageBorder: {
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.42)',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 130,
    height: 130,
    overflow: 'hidden',
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9A620',
  },
  tabsWrapper: {
    marginTop: 40,
    width: width * 0.85,
  },
  glassWrapper: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    //borderColor: 'rgba(255, 255, 255, 0.42)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 4,
  },
  glassTab: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    borderColor: 'rgba(197, 197, 197, 0.94)',
    borderWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#104911',
    textAlign: 'left',
    flex: 1,
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 40,
    marginBottom: 60,
    width: width * 0.85,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#AA2A2A',
    textAlign: 'left',
    flex: 1,
  },
});
