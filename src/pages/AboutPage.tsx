import React from 'react';
import { MapPin, Users, Factory, Award, Truck, Phone } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="bg-primary-900 py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-white mb-6">About ASIM AGRO</h1>
            <p className="text-primary-100 text-lg">
              A leading manufacturer of premium fertilizers committed to enhancing agricultural productivity and sustainability.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-primary-900 mb-6">Our Story</h2>
              <p className="text-gray-700 mb-4">
                Founded in 2005 in the agricultural heartland of Maharashtra, ASIM AGRO began with a simple mission: to provide farmers with superior quality fertilizers that enhance crop yield while preserving soil health for future generations.
              </p>
              <p className="text-gray-700 mb-4">
                What started as a small manufacturing unit in Kadegoan has grown into one of the region's most trusted agricultural input producers, serving thousands of farmers across multiple states.
              </p>
              <p className="text-gray-700">
                Our founder, Mr. Ashok Patil, a former agricultural scientist, established ASIM AGRO based on his extensive research and deep understanding of soil science and plant nutrition. His vision continues to guide our company's commitment to innovation and excellence.
              </p>
            </div>
            <div className="relative animate-slide-up">
              <img
                src="https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Modern agricultural facility"
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 h-32 w-32 bg-primary-500 rounded-full opacity-20"></div>
              <div className="absolute -top-6 -right-6 h-24 w-24 bg-accent-400 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="bg-primary-800 py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-white mb-2">15+</div>
              <div className="text-primary-100">Years in Business</div>
            </div>
            <div className="animate-fade-in delay-100">
              <div className="text-4xl font-bold text-white mb-2">10,000+</div>
              <div className="text-primary-100">Farmers Served</div>
            </div>
            <div className="animate-fade-in delay-200">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-primary-100">Dealer Network</div>
            </div>
            <div className="animate-fade-in delay-300">
              <div className="text-4xl font-bold text-white mb-2">20+</div>
              <div className="text-primary-100">Product Varieties</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
            <h2 className="text-primary-900 mb-6">Our Values</h2>
            <p className="text-gray-700">
              At ASIM AGRO, our core values guide everything we do - from product formulation to customer service and environmental responsibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full inline-flex mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-900">Quality Excellence</h3>
              <p className="text-gray-700">
                We maintain the highest standards in our manufacturing processes, ensuring each product delivers consistent performance in the field.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full inline-flex mb-4">
                <Factory className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-900">Innovation</h3>
              <p className="text-gray-700">
                Our team of agronomists continuously research and develop new formulations to address evolving agricultural challenges.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="bg-primary-100 text-primary-600 p-3 rounded-full inline-flex mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-900">Farmer Success</h3>
              <p className="text-gray-700">
                We measure our success by the prosperity of the farmers who use our products, ensuring they receive both quality inputs and technical support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Manufacturing Process */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 animate-slide-up">
              <img
                src="https://images.pexels.com/photos/2284170/pexels-photo-2284170.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Modern manufacturing facility"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="order-1 lg:order-2 animate-fade-in">
              <h2 className="text-primary-900 mb-6">Our Manufacturing Process</h2>
              <p className="text-gray-700 mb-4">
                ASIM AGRO's state-of-the-art manufacturing facility in Kadegoan follows a rigorous production process that emphasizes quality, precision, and environmental responsibility.
              </p>
              
              <div className="space-y-6 mt-8">
                <div className="flex items-start">
                  <div className="bg-primary-100 text-primary-600 p-2 rounded-full flex-shrink-0 mr-4">
                    <span className="font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-800 mb-1">Raw Material Selection</h3>
                    <p className="text-gray-600">We source the finest raw materials from trusted suppliers, ensuring they meet our stringent quality standards.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 text-primary-600 p-2 rounded-full flex-shrink-0 mr-4">
                    <span className="font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-800 mb-1">Precision Formulation</h3>
                    <p className="text-gray-600">Our team utilizes advanced technology to create precise nutrient formulations tailored to different crop requirements.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 text-primary-600 p-2 rounded-full flex-shrink-0 mr-4">
                    <span className="font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-800 mb-1">Quality Testing</h3>
                    <p className="text-gray-600">Every batch undergoes rigorous quality testing in our in-house laboratory to ensure it meets both regulatory standards and our own quality benchmarks.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 text-primary-600 p-2 rounded-full flex-shrink-0 mr-4">
                    <span className="font-semibold">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-800 mb-1">Packaging & Distribution</h3>
                    <p className="text-gray-600">Our products are packaged in moisture-resistant materials and distributed through our extensive dealer network to ensure freshness.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
            <h2 className="text-primary-900 mb-6">Our Leadership</h2>
            <p className="text-gray-700">
              Meet the team that drives our vision of agricultural innovation and excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src="https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Ashok Patil - Founder & CEO"
                className="w-full h-64 object-cover object-center"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1 text-primary-900">Ashok Patil</h3>
                <p className="text-primary-600 mb-4">Founder & CEO</p>
                <p className="text-gray-700">
                  Agricultural scientist with 25 years of experience in soil science and plant nutrition research.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src="https://images.pexels.com/photos/6632810/pexels-photo-6632810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Priya Sharma - Technical Director"
                className="w-full h-64 object-cover object-center"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1 text-primary-900">Priya Sharma</h3>
                <p className="text-primary-600 mb-4">Technical Director</p>
                <p className="text-gray-700">
                  Ph.D. in Agricultural Chemistry, leads our research and development efforts.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src="https://images.pexels.com/photos/8431885/pexels-photo-8431885.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Rajesh Kumar - Operations Head"
                className="w-full h-64 object-cover object-center"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1 text-primary-900">Rajesh Kumar</h3>
                <p className="text-primary-600 mb-4">Operations Head</p>
                <p className="text-gray-700">
                  MBA with 15 years of experience in agricultural supply chain management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-primary-900 mb-6">Visit Our Facility</h2>
              <p className="text-gray-700 mb-6">
                We welcome dealer visits to our manufacturing facility in Kadegoan, where you can witness our production processes and quality control measures firsthand.
              </p>
              
              <div className="flex items-start mb-4">
                <MapPin className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Factory Address</h3>
                  <p className="text-gray-700">
                    ASIM AGRO Industries<br />
                    Plot 123, MIDC Industrial Area<br />
                    Kadegoan, Maharashtra 415304<br />
                    India
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Contact</h3>
                  <p className="text-gray-700">
                    Phone: +91 1234567890<br />
                    Email: factory@asimagro.com
                  </p>
                </div>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <img
                src="https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Factory location"
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-primary-500 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;