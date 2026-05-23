import Image from "next/image";
import {
  Heart, Shield, Award, TrendingUp,
  Globe, Users, Car, MapPin,
  ShieldCheck, PhoneCall
} from "lucide-react";

export default function AboutPage() {
  return (
    <main>
      {/* HERO SECTION */}
      <section className="about-hero bg-gradient-to-br from-blue-600 to-blue-800 text-white py-32 text-center">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-5xl font-extrabold mb-4">About DriveAway</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            We're revolutionizing car rentals by combining premium vehicles, exceptional service, and cutting-edge technology to make your journey unforgettable.
          </p>
        </div>
      </section>

      {/* OUR STORY SECTION */}
      <section className="container mx-auto px-4 max-w-7xl py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* TEXT */}
          <div>
            <h2 className="text-4xl font-bold mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Founded in 2018, DriveAway began with a simple mission: to make car rental accessible, affordable, and enjoyable for everyone.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              What started as a small fleet of 20 vehicles has grown into a nationwide service with over 5,000 premium cars.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, we're proud to serve over 100,000 customers annually, maintaining our commitment to quality and transparency.
            </p>
          </div>

          {/* IMAGE */}
          <div className="relative w-full h-[400px] lg:h-[500px]">
            <Image
              src="/static/about/our-team.jpg"
              alt="DriveAway Team"
              fill
              className="rounded-2xl shadow-xl object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

        </div>
      </section>

      {/* NUMBERS */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-16">DriveAway by the Numbers</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "5,000+", label: "Vehicles Available" },
              { value: "50+", label: "Locations" },
              { value: "100K+", label: "Happy Customers" },
              { value: "4.8★", label: "Average Rating" },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-5xl font-extrabold mb-2">{item.value}</div>
                <div className="text-sm opacity-80 uppercase tracking-wider font-semibold">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="container mx-auto px-4 max-w-7xl py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Our Core Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Heart, title: "Customer First", desc: "Your satisfaction is our priority." },
            { icon: Shield, title: "Trust & Transparency", desc: "No hidden fees." },
            { icon: Award, title: "Excellence", desc: "Top quality service." },
            { icon: TrendingUp, title: "Innovation", desc: "We improve constantly." },
            { icon: Globe, title: "Sustainability", desc: "Eco-friendly fleet." },
            { icon: Users, title: "Community", desc: "We support local communities." },
          ].map((value, i) => (
            <div key={i} className="bg-white p-10 rounded-2xl shadow-sm text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <value.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">{value.title}</h3>
              <p className="text-gray-500 text-sm">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="container mx-auto px-4 max-w-7xl py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose DriveAway?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: Car, title: "Premium Fleet", desc: "Latest cars maintained to highest standards." },
            { icon: MapPin, title: "Convenient Locations", desc: "50+ pickup locations." },
            { icon: ShieldCheck, title: "Flexible Policies", desc: "No hidden fees." },
            { icon: PhoneCall, title: "24/7 Support", desc: "Always here for you." },
          ].map((why, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl flex gap-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <why.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">{why.title}</h3>
                <p className="text-gray-500 text-sm">{why.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}