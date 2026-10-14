import { apiClient } from "../client";

export const cmsService = {
  /**
   * Fetch Hero section data
   */
  getHeroData: () => apiClient("/cms/hero"),

  /**
   * Fetch Service section data
   */
  getServiceData: () => apiClient("/cms/service"),

  /**
   * Fetch "Why Choose Us" section data
   */
  getChooseUsData: () => apiClient("/cms/choose-us"),

  /**
   * Fetch "How It Works" section data
   */
  getHowItWorksData: () => apiClient("/cms/how-works"),

  /**
   * Fetch FAQ section data
   */
  getFaqsData: () => apiClient("/cms/faqs"),

  /**
   * Fetch "Our Mission / Story" section data
   */
  getMissionData: () => apiClient("/cms/missions"),

  /**
   * Fetch "Get the app" CTA data
   */
  getGetAppData: () => apiClient("/get-in-app"),

  /**
   * Fetch contact section data
   */
  getContactData: () => apiClient("/cms/contact"),

  /**
   * Fetch header / marquee data
   */
  getHeaderData: () => apiClient("/cms/header"),

  /**
   * Fetch Testimonials section data
   */
  getTestimonialsData: () => apiClient("/cms/testimonials"),
};
